import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthSessionData } from "../auth/auth.types";
import { CreateGradeDto, GradeImportDto, UpdateGradeDto } from "../common/dto/grade.dto";

@Injectable()
export class GradesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Compute the weighted average for a student in a course.
   * Falls back to a simple average when no weights are configured.
   */
  async calculateWeightedAverage(courseId: string, studentId: string): Promise<number | null> {
    const [grades, weights] = await Promise.all([
      this.prisma.grade.findMany({ where: { courseId, studentId } }),
      this.prisma.courseEvaluationWeight.findMany({ where: { courseId } }),
    ]);

    if (grades.length === 0) return null;
    if (weights.length === 0) {
      return grades.reduce((sum, g) => sum + g.score, 0) / grades.length;
    }

    const weightMap = new Map(weights.map((w) => [w.type, w.weight]));
    let weightedSum = 0;
    let totalWeight = 0;
    for (const grade of grades) {
      const w = weightMap.get(grade.evaluationType) ?? 1;
      weightedSum += grade.score * w;
      totalWeight += w;
    }
    return totalWeight === 0 ? null : weightedSum / totalWeight;
  }

  /** Record a grade — student must be enrolled in the course. */
  async create(dto: CreateGradeDto, actor: AuthSessionData) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { courseId_studentId: { courseId: dto.courseId, studentId: dto.studentId } },
    });
    if (!enrollment) {
      throw new BadRequestException(
        "Student is not enrolled in this course.",
      );
    }

    const role = (actor as unknown as { role: string }).role;
    if (role === "TEACHER") {
      const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
      if (course?.teacherId !== actor.user.id) {
        throw new ForbiddenException("You can only record grades for your own courses.");
      }
    }

    const grade = await this.prisma.grade.create({
      data: {
        courseId: dto.courseId,
        studentId: dto.studentId,
        evaluationType: dto.evaluationType ?? "EXAM",
        score: dto.score,
        recordedById: actor.user.id,
      },
    });

    const average = await this.calculateWeightedAverage(dto.courseId, dto.studentId);
    return { ...grade, weightedAverage: average };
  }

  /** Update an existing grade. Teachers can only update grades they recorded. */
  async update(id: string, dto: UpdateGradeDto, actor: AuthSessionData) {
    const grade = await this.prisma.grade.findUnique({ where: { id } });
    if (!grade) {
      throw new NotFoundException(`Grade ${id} not found.`);
    }

    const role = (actor as unknown as { role: string }).role;
    if (role === "TEACHER" && grade.recordedById !== actor.user.id) {
      throw new ForbiddenException("You can only update grades you recorded.");
    }

    const updated = await this.prisma.grade.update({ where: { id }, data: dto });
    const average = await this.calculateWeightedAverage(grade.courseId, grade.studentId);
    return { ...updated, weightedAverage: average };
  }

  /**
   * Import grades in bulk — all-or-nothing transaction.
   * Returns an error report if any row is invalid; nothing is persisted.
   */
  async importCsv(dto: GradeImportDto, actor: AuthSessionData) {
    const errors: Array<{ row: number; reason: string }> = [];
    type GradeData = {
      courseId: string;
      studentId: string;
      evaluationType: string;
      score: number;
      recordedById: string;
    };
    const gradeData: GradeData[] = [];

    for (let i = 0; i < dto.rows.length; i++) {
      const row = dto.rows[i];

      let studentId = row.studentId;
      if (!studentId && row.studentEmail) {
        const user = await this.prisma.user.findUnique({
          where: { email: row.studentEmail },
        });
        if (!user) {
          errors.push({ row: i + 1, reason: `Student email "${row.studentEmail}" not found.` });
          continue;
        }
        studentId = user.id;
      }

      if (!studentId) {
        errors.push({ row: i + 1, reason: "Either studentId or studentEmail is required." });
        continue;
      }

      const enrollment = await this.prisma.enrollment.findUnique({
        where: { courseId_studentId: { courseId: row.courseId, studentId } },
      });
      if (!enrollment) {
        errors.push({ row: i + 1, reason: `Student is not enrolled in course ${row.courseId}.` });
        continue;
      }

      gradeData.push({
        courseId: row.courseId,
        studentId,
        evaluationType: row.evaluationType ?? "EXAM",
        score: row.score,
        recordedById: actor.user.id,
      });
    }

    if (errors.length > 0) {
      return { success: false, errors, imported: 0 };
    }

    await this.prisma.$transaction(
      gradeData.map((g) => this.prisma.grade.create({ data: g })),
    );

    return { success: true, errors: [], imported: gradeData.length };
  }
}
