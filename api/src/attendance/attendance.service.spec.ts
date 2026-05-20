import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AttendanceService } from "./attendance.service";
import { PrismaService } from "../prisma/prisma.service";

const mockPrisma = {
  course: { findUnique: jest.fn() },
  courseSession: { findUnique: jest.fn(), create: jest.fn(), count: jest.fn() },
  attendanceRecord: { upsert: jest.fn(), count: jest.fn() },
  enrollment: { updateMany: jest.fn() },
  $transaction: jest.fn(),
};

const adminActor = {
  user: { id: "admin-id" },
  session: { id: "session-id" },
  role: "ADMIN",
} as any;

const teacherActor = {
  user: { id: "teacher-id" },
  session: { id: "session-id" },
  role: "TEACHER",
} as any;

const course = { id: "c1", teacherId: "teacher-id" };
const session = { id: "sess1", courseId: "c1", course };

describe("AttendanceService", () => {
  let service: AttendanceService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttendanceService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<AttendanceService>(AttendanceService);
  });

  describe("createSession", () => {
    it("throws NotFoundException when course does not exist", async () => {
      mockPrisma.course.findUnique.mockResolvedValue(null);
      await expect(
        service.createSession({ courseId: "c1", sessionDate: new Date() }, adminActor),
      ).rejects.toThrow(NotFoundException);
    });

    it("throws ForbiddenException when teacher creates session for another teacher course", async () => {
      mockPrisma.course.findUnique.mockResolvedValue({ id: "c1", teacherId: "other-teacher" });
      await expect(
        service.createSession({ courseId: "c1", sessionDate: new Date() }, teacherActor),
      ).rejects.toThrow(ForbiddenException);
    });

    it("creates the session", async () => {
      mockPrisma.course.findUnique.mockResolvedValue(course);
      mockPrisma.courseSession.create.mockResolvedValue({ id: "sess1", courseId: "c1" });
      const result = await service.createSession(
        { courseId: "c1", sessionDate: new Date() },
        teacherActor,
      );
      expect(result.id).toBe("sess1");
    });
  });

  describe("recordBulk", () => {
    it("throws NotFoundException when session does not exist", async () => {
      mockPrisma.courseSession.findUnique.mockResolvedValue(null);
      await expect(
        service.recordBulk(
          { sessionId: "sess1", records: [{ studentId: "s1", status: "PRESENT" as const }] },
          adminActor,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it("throws ForbiddenException when teacher records for another teacher session", async () => {
      mockPrisma.courseSession.findUnique.mockResolvedValue({
        ...session,
        course: { ...course, teacherId: "other-teacher" },
      });
      await expect(
        service.recordBulk(
          { sessionId: "sess1", records: [{ studentId: "s1", status: "PRESENT" as const }] },
          teacherActor,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it("upserts records and recalculates atRisk", async () => {
      mockPrisma.courseSession.findUnique.mockResolvedValue(session);
      const upserted = { id: "r1", sessionId: "sess1", studentId: "s1", status: "ABSENT" };
      mockPrisma.$transaction.mockResolvedValue([upserted]);
      mockPrisma.courseSession.count.mockResolvedValue(3);
      mockPrisma.attendanceRecord.count.mockResolvedValue(2);
      mockPrisma.enrollment.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.recordBulk(
        { sessionId: "sess1", records: [{ studentId: "s1", status: "ABSENT" as const }] },
        adminActor,
      );

      expect(result.recorded).toBe(1);
      expect(mockPrisma.enrollment.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { atRisk: true } }),
      );
    });

    it("marks student as not atRisk when absence rate is below threshold", async () => {
      mockPrisma.courseSession.findUnique.mockResolvedValue(session);
      mockPrisma.$transaction.mockResolvedValue([{ id: "r1" }]);
      mockPrisma.courseSession.count.mockResolvedValue(10);
      mockPrisma.attendanceRecord.count.mockResolvedValue(1);
      mockPrisma.enrollment.updateMany.mockResolvedValue({ count: 1 });

      await service.recordBulk(
        { sessionId: "sess1", records: [{ studentId: "s1", status: "PRESENT" as const }] },
        adminActor,
      );

      expect(mockPrisma.enrollment.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { atRisk: false } }),
      );
    });
  });
});
