import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GradesService } from "../grades/grades.service";
import {
  BulkEnrollmentImportDto,
  SemesterReportQueryDto,
  StatsQueryDto,
} from "./admin.dto";

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gradesService: GradesService,
  ) {}

  /**
   * Import enrollments in bulk, best-effort mode.
   * Returns a report of successes and per-row errors.
   */
  async importEnrollments(dto: BulkEnrollmentImportDto) {
    const enrolled: string[] = [];
    const errors: Array<{ row: number; reason: string }> = [];

    for (let i = 0; i < dto.rows.length; i++) {
      const row = dto.rows[i];
      try {
        const course = await this.prisma.course.findUnique({
          where: { id: row.courseId },
          include: { _count: { select: { enrollments: true } } },
        });
        if (!course) {
          errors.push({ row: i + 1, reason: `Course ${row.courseId} not found.` });
          continue;
        }
        if (course._count.enrollments >= course.capacity) {
          errors.push({ row: i + 1, reason: `Course "${course.title}" is at full capacity.` });
          continue;
        }
        const existing = await this.prisma.enrollment.findUnique({
          where: {
            courseId_studentId: { courseId: row.courseId, studentId: row.studentId },
          },
        });
        if (existing) {
          errors.push({ row: i + 1, reason: "Student already enrolled in this course." });
          continue;
        }
        await this.prisma.enrollment.create({
          data: { courseId: row.courseId, studentId: row.studentId },
        });
        enrolled.push(`${row.studentId}→${row.courseId}`);
      } catch {
        errors.push({ row: i + 1, reason: "Unexpected error during enrollment." });
      }
    }

    return { enrolled: enrolled.length, errors };
  }

  /**
   * Export a per-student, per-course result report for a semester.
   * Includes weighted averages and atRisk status.
   */
  async exportSemesterReport(query: SemesterReportQueryDto) {
    const semester = await this.prisma.semester.findUnique({
      where: { id: query.semesterId },
    });
    if (!semester) {
      throw new NotFoundException(`Semester ${query.semesterId} not found.`);
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const enrollments = await this.prisma.enrollment.findMany({
      where: { course: { semesterId: query.semesterId } },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: {
          select: {
            id: true,
            code: true,
            title: true,
            weights: true,
          },
        },
      },
    });

    const total = await this.prisma.enrollment.count({
      where: { course: { semesterId: query.semesterId } },
    });

    const rows = await Promise.all(
      enrollments.map(async (e) => {
        const average = await this.gradesService.calculateWeightedAverage(
          e.courseId,
          e.studentId,
        );
        return {
          studentId: e.student.id,
          studentName: e.student.name,
          studentEmail: e.student.email,
          courseId: e.course.id,
          courseCode: e.course.code,
          courseTitle: e.course.title,
          weightedAverage: average,
          atRisk: e.atRisk,
        };
      }),
    );

    return { semester: semester.name, total, page, limit, rows };
  }

  /** Global stats for a semester (or all data if no semesterId given). */
  async getStats(query: StatsQueryDto) {
    const courseFilter = query.semesterId ? { semesterId: query.semesterId } : {};
    const enrollmentFilter = query.semesterId
      ? { course: { semesterId: query.semesterId } }
      : {};

    const [totalCourses, totalEnrollments, atRiskCount, gradeStats] = await Promise.all([
      this.prisma.course.count({ where: courseFilter }),
      this.prisma.enrollment.count({ where: enrollmentFilter }),
      this.prisma.enrollment.count({ where: { ...enrollmentFilter, atRisk: true } }),
      this.prisma.grade.aggregate({
        _avg: { score: true },
        _count: { id: true },
        ...(query.semesterId
          ? { where: { course: { semesterId: query.semesterId } } }
          : {}),
      }),
    ]);

    return {
      totalCourses,
      totalEnrollments,
      atRiskCount,
      totalGrades: gradeStats._count.id,
      averageScore: gradeStats._avg.score,
    };
  }
}
