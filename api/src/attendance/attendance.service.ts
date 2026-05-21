import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthSessionData } from "../auth/auth.types";
import { BulkAttendanceDto, CreateCourseSessionDto } from "../common/dto/attendance.dto";

const AT_RISK_THRESHOLD = 0.33;

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  /** List course sessions, optionally filtered by course. */
  async listSessions(courseId?: string) {
    return this.prisma.courseSession.findMany({
      where: courseId ? { courseId } : undefined,
      include: { course: { select: { id: true, title: true, code: true } } },
      orderBy: { sessionDate: "desc" },
    });
  }

  /** Create an attendance session for a course. Teachers can only do this for their own courses. */
  async createSession(dto: CreateCourseSessionDto, actor: AuthSessionData) {
    const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
    if (!course) {
      throw new NotFoundException(`Course ${dto.courseId} not found.`);
    }

    const role = (actor as unknown as { role: string }).role;
    if (role === "TEACHER" && course.teacherId !== actor.user.id) {
      throw new ForbiddenException("You can only create sessions for your own courses.");
    }

    return this.prisma.courseSession.create({
      data: {
        courseId: dto.courseId,
        sessionDate: dto.sessionDate,
        topic: dto.topic,
      },
    });
  }

  /**
   * Record attendance for an entire session in bulk.
   * After persisting, recalculates atRisk for each student based on absence rate.
   */
  async recordBulk(dto: BulkAttendanceDto, actor: AuthSessionData) {
    const session = await this.prisma.courseSession.findUnique({
      where: { id: dto.sessionId },
      include: { course: true },
    });
    if (!session) {
      throw new NotFoundException(`Session ${dto.sessionId} not found.`);
    }

    const role = (actor as unknown as { role: string }).role;
    if (role === "TEACHER" && session.course.teacherId !== actor.user.id) {
      throw new ForbiddenException("You can only record attendance for your own courses.");
    }

    // Upsert all attendance records
    const upserts = dto.records.map((r) =>
      this.prisma.attendanceRecord.upsert({
        where: {
          sessionId_studentId: { sessionId: dto.sessionId, studentId: r.studentId },
        },
        create: {
          sessionId: dto.sessionId,
          studentId: r.studentId,
          status: r.status,
        },
        update: { status: r.status },
      }),
    );
    const records = await this.prisma.$transaction(upserts);

    // Recalculate atRisk for each student who had an attendance recorded
    await this.recalcAtRisk(session.courseId, dto.records.map((r) => r.studentId));

    return { sessionId: dto.sessionId, recorded: records.length, records };
  }

  /**
   * Recalculate the atRisk flag for a set of students in a course.
   * A student is atRisk when their absence rate exceeds AT_RISK_THRESHOLD.
   */
  private async recalcAtRisk(courseId: string, studentIds: string[]) {
    const totalSessions = await this.prisma.courseSession.count({ where: { courseId } });
    if (totalSessions === 0) return;

    for (const studentId of studentIds) {
      const absences = await this.prisma.attendanceRecord.count({
        where: {
          studentId,
          status: "ABSENT",
          session: { courseId },
        },
      });

      const atRisk = absences / totalSessions > AT_RISK_THRESHOLD;
      await this.prisma.enrollment.updateMany({
        where: { courseId, studentId },
        data: { atRisk },
      });
    }
  }
}
