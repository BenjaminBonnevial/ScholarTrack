/**
 * Academic flow integration tests — requires a running PostgreSQL database.
 * Set DATABASE_URL to run; tests are skipped automatically when absent.
 *
 * Uses a test module that bypasses Better Auth (AuthModule is excluded) so the
 * better-auth ESM package does not conflict with Jest's CommonJS mode. Auth is
 * simulated by injecting req.auth via a middleware before each request.
 *
 * No Prisma mocks — every assertion hits the real database.
 */

import {
  ExecutionContext,
  INestApplication,
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
  ValidationPipe,
} from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";

import { Role } from "@prisma/client";
import { randomUUID } from "crypto";
import { PrismaModule } from "../src/prisma/prisma.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { CoursesModule } from "../src/courses/courses.module";
import { GradesModule } from "../src/grades/grades.module";
import { AttendanceModule } from "../src/attendance/attendance.module";
import { SemestersModule } from "../src/semesters/semesters.module";
import { EnrollmentsModule } from "../src/enrollments/enrollments.module";
import { AdminModule } from "../src/admin/admin.module";
import { RateLimitMiddleware } from "../src/common/middleware/rate-limit.middleware";
import { RolesGuard } from "../src/auth/guards/roles.guard";

const DB_AVAILABLE = !!process.env.DATABASE_URL;
const RUN = Date.now().toString(36);

// Fake session guard: reads actor info from test headers and populates req.auth
class TestSessionGuard {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      auth?: unknown;
      headers: Record<string, string | undefined>;
    }>();
    const userId = req.headers["x-actor-id"];
    const role = req.headers["x-actor-role"] ?? "ADMIN";
    if (userId) {
      req.auth = { user: { id: userId }, session: { id: "test-session" }, role };
    }
    return true;
  }
}

@Module({
  imports: [
    PrismaModule,
    CoursesModule,
    GradesModule,
    AttendanceModule,
    SemestersModule,
    EnrollmentsModule,
    AdminModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: TestSessionGuard },
    // RolesGuard reads @Roles() metadata; keep it real so role-based restrictions work
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
class AcademicTestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}

describe("Academic flow (integration)", () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let adminId: string;
  let teacherId: string;
  let studentId: string;
  let semesterId: string;
  let courseId: string;

  const adminHeaders = () => ({ "x-actor-id": adminId, "x-actor-role": "ADMIN" });
  const teacherHeaders = () => ({ "x-actor-id": teacherId, "x-actor-role": "TEACHER" });

  beforeAll(async () => {
    if (!DB_AVAILABLE) return;

    const moduleRef = await Test.createTestingModule({
      imports: [AcademicTestModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    prisma = moduleRef.get(PrismaService);

    // Seed test users directly (no Better Auth sign-up needed)
    const admin = await prisma.user.create({
      data: {
        id: randomUUID(),
        name: `Admin ${RUN}`,
        email: `admin+${RUN}@test.local`,
        role: Role.ADMIN,
        emailVerified: true,
      },
    });
    adminId = admin.id;

    const teacher = await prisma.user.create({
      data: {
        id: randomUUID(),
        name: `Teacher ${RUN}`,
        email: `teacher+${RUN}@test.local`,
        role: Role.TEACHER,
        emailVerified: true,
      },
    });
    teacherId = teacher.id;

    const student = await prisma.user.create({
      data: {
        id: randomUUID(),
        name: `Student ${RUN}`,
        email: `student+${RUN}@test.local`,
        role: Role.STUDENT,
        emailVerified: true,
      },
    });
    studentId = student.id;
  });

  afterAll(async () => {
    if (!DB_AVAILABLE || !prisma) return;

    await prisma.attendanceRecord.deleteMany({
      where: { session: { course: { code: { startsWith: `TST${RUN}` } } } },
    });
    await prisma.courseSession.deleteMany({
      where: { course: { code: { startsWith: `TST${RUN}` } } },
    });
    await prisma.grade.deleteMany({
      where: { course: { code: { startsWith: `TST${RUN}` } } },
    });
    await prisma.enrollment.deleteMany({
      where: { course: { code: { startsWith: `TST${RUN}` } } },
    });
    await prisma.courseEvaluationWeight.deleteMany({
      where: { course: { code: { startsWith: `TST${RUN}` } } },
    });
    await prisma.course.deleteMany({ where: { code: { startsWith: `TST${RUN}` } } });
    await prisma.semester.deleteMany({ where: { name: { startsWith: `Test ${RUN}` } } });
    await prisma.user.deleteMany({ where: { email: { endsWith: `+${RUN}@test.local` } } });

    await app.close();
  });

  // ================================================================== tests

  it("is skipped when DATABASE_URL is not set", () => {
    if (!DB_AVAILABLE) {
      console.warn("DATABASE_URL not set — skipping DB integration tests.");
    }
    expect(true).toBe(true);
  });

  // ------------------------------------------------------------------
  // Semesters
  // ------------------------------------------------------------------

  it("creates and lists semesters", async () => {
    if (!DB_AVAILABLE) return;

    const res = await request(app.getHttpServer())
      .post("/semesters")
      .set(adminHeaders())
      .send({ name: `Test ${RUN} Semester`, startDate: "2026-09-01", endDate: "2026-12-31" })
      .expect(201);

    semesterId = res.body.id as string;
    expect(semesterId).toBeTruthy();

    const list = await request(app.getHttpServer())
      .get("/semesters")
      .set(adminHeaders())
      .expect(200);

    expect(list.body.items.some((s: { id: string }) => s.id === semesterId)).toBe(true);
  });

  // ------------------------------------------------------------------
  // Courses
  // ------------------------------------------------------------------

  it("creates a course with evaluation weights", async () => {
    if (!DB_AVAILABLE) return;

    const res = await request(app.getHttpServer())
      .post("/courses")
      .set(teacherHeaders())
      .send({
        code: `TST${RUN}`,
        title: "Integration Test Course",
        capacity: 5,
        semesterId,
        teacherId,
        weights: [
          { type: "EXAM", weight: 70 },
          { type: "HOMEWORK", weight: 30 },
        ],
      })
      .expect(201);

    courseId = res.body.id as string;
    expect(courseId).toBeTruthy();
  });

  it("rejects a duplicate course code", async () => {
    if (!DB_AVAILABLE) return;

    await request(app.getHttpServer())
      .post("/courses")
      .set(teacherHeaders())
      .send({ code: `TST${RUN}`, title: "Dup", capacity: 5, semesterId, teacherId })
      .expect(409);
  });

  // ------------------------------------------------------------------
  // Enrollments
  // ------------------------------------------------------------------

  it("enrolls the student", async () => {
    if (!DB_AVAILABLE) return;

    await request(app.getHttpServer())
      .post("/enrollments")
      .set(adminHeaders())
      .send({ courseId, studentId })
      .expect(201);
  });

  it("rejects duplicate enrollment", async () => {
    if (!DB_AVAILABLE) return;

    await request(app.getHttpServer())
      .post("/enrollments")
      .set(adminHeaders())
      .send({ courseId, studentId })
      .expect(409);
  });

  it("rejects enrollment when course is full", async () => {
    if (!DB_AVAILABLE) return;

    // Capacity = 5; studentId already enrolled; add 4 more to fill it
    for (let i = 0; i < 4; i++) {
      const extra = await prisma.user.create({
        data: {
          id: randomUUID(),
          name: `Extra${i} ${RUN}`,
          email: `extra${i}+${RUN}@test.local`,
          role: Role.STUDENT,
          emailVerified: true,
        },
      });
      await request(app.getHttpServer())
        .post("/enrollments")
        .set(adminHeaders())
        .send({ courseId, studentId: extra.id })
        .expect(201);
    }

    const overflow = await prisma.user.create({
      data: {
        id: randomUUID(),
        name: `Overflow ${RUN}`,
        email: `overflow+${RUN}@test.local`,
        role: Role.STUDENT,
        emailVerified: true,
      },
    });
    await request(app.getHttpServer())
      .post("/enrollments")
      .set(adminHeaders())
      .send({ courseId, studentId: overflow.id })
      .expect(400);
  });

  // ------------------------------------------------------------------
  // Grades — weighted average
  // ------------------------------------------------------------------

  it("records an EXAM grade and returns weighted average", async () => {
    if (!DB_AVAILABLE) return;

    const res = await request(app.getHttpServer())
      .post("/grades")
      .set(teacherHeaders())
      .send({ courseId, studentId, evaluationType: "EXAM", score: 16 })
      .expect(201);

    expect(res.body.score).toBe(16);
    // With only EXAM grades, average = 16
    expect(res.body.weightedAverage).toBeCloseTo(16);
  });

  it("records a HOMEWORK grade and recalculates weighted average", async () => {
    if (!DB_AVAILABLE) return;

    const res = await request(app.getHttpServer())
      .post("/grades")
      .set(teacherHeaders())
      .send({ courseId, studentId, evaluationType: "HOMEWORK", score: 18 })
      .expect(201);

    // EXAM 16 × 70 + HOMEWORK 18 × 30 = 1120 + 540 = 1660 / 100 = 16.6
    expect(res.body.weightedAverage).toBeCloseTo(16.6);
  });

  it("rejects a grade for a student not enrolled in the course", async () => {
    if (!DB_AVAILABLE) return;

    const stranger = await prisma.user.create({
      data: {
        id: randomUUID(),
        name: `Stranger ${RUN}`,
        email: `stranger+${RUN}@test.local`,
        role: Role.STUDENT,
        emailVerified: true,
      },
    });

    await request(app.getHttpServer())
      .post("/grades")
      .set(teacherHeaders())
      .send({ courseId, studentId: stranger.id, evaluationType: "EXAM", score: 10 })
      .expect(400);
  });

  // ------------------------------------------------------------------
  // Grade CSV import — all-or-nothing transaction
  // ------------------------------------------------------------------

  it("imports a valid batch of grades", async () => {
    if (!DB_AVAILABLE) return;

    const res = await request(app.getHttpServer())
      .post("/grades/import")
      .set(teacherHeaders())
      .send({
        rows: [{ courseId, studentEmail: `student+${RUN}@test.local`, evaluationType: "EXAM", score: 12 }],
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.imported).toBe(1);
  });

  it("rejects CSV import when any row is invalid — nothing is persisted", async () => {
    if (!DB_AVAILABLE) return;

    const countBefore = await prisma.grade.count({ where: { courseId, studentId } });

    const res = await request(app.getHttpServer())
      .post("/grades/import")
      .set(teacherHeaders())
      .send({
        rows: [
          { courseId, studentEmail: `student+${RUN}@test.local`, evaluationType: "EXAM", score: 15 },
          { courseId, studentEmail: "nobody+nonexistent@test.local", evaluationType: "EXAM", score: 10 },
        ],
      })
      .expect(201);

    expect(res.body.success).toBe(false);
    expect(res.body.errors.length).toBeGreaterThan(0);
    expect(res.body.imported).toBe(0);

    const countAfter = await prisma.grade.count({ where: { courseId, studentId } });
    expect(countAfter).toBe(countBefore);
  });

  // ------------------------------------------------------------------
  // Attendance — atRisk flag
  // ------------------------------------------------------------------

  it("sets atRisk=true after the student accumulates >33% absences", async () => {
    if (!DB_AVAILABLE) return;

    // Create 4 sessions, mark student absent in 2 (50% > 33%)
    const sessionIds: string[] = [];
    for (let i = 0; i < 4; i++) {
      const s = await request(app.getHttpServer())
        .post("/attendance/sessions")
        .set(teacherHeaders())
        .send({ courseId, sessionDate: new Date(Date.now() + i * 86400000).toISOString() })
        .expect(201);
      sessionIds.push(s.body.id as string);
    }

    for (const sid of sessionIds.slice(0, 2)) {
      await request(app.getHttpServer())
        .post("/attendance/records")
        .set(teacherHeaders())
        .send({ sessionId: sid, records: [{ studentId, status: "ABSENT" }] })
        .expect(201);
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { courseId_studentId: { courseId, studentId } },
    });
    expect(enrollment?.atRisk).toBe(true);
  });

  // ------------------------------------------------------------------
  // Admin
  // ------------------------------------------------------------------

  it("returns aggregate stats for a semester", async () => {
    if (!DB_AVAILABLE) return;

    const res = await request(app.getHttpServer())
      .get("/admin/stats")
      .set(adminHeaders())
      .query({ semesterId })
      .expect(200);

    expect(res.body).toHaveProperty("enrollments");
    expect(res.body).toHaveProperty("courses");
  });
});
