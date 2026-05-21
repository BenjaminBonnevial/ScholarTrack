import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EnrollStudentDto } from "../common/dto/enrollment.dto";

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /** List enrollments, optionally filtered by courseId. */
  async list(courseId?: string) {
    return this.prisma.enrollment.findMany({
      where: courseId ? { courseId } : undefined,
      include: {
        course: { select: { id: true, code: true, title: true } },
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { enrolledAt: "desc" },
    });
  }

  /** Enroll a student in a course with capacity and duplicate checks. */
  async enroll(dto: EnrollStudentDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
      include: { _count: { select: { enrollments: true } } },
    });
    if (!course) {
      throw new NotFoundException(`Course ${dto.courseId} not found.`);
    }

    const student = await this.prisma.user.findUnique({ where: { id: dto.studentId } });
    if (!student) {
      throw new NotFoundException(`Student ${dto.studentId} not found.`);
    }
    if (student.role !== "STUDENT") {
      throw new BadRequestException("Only students can be enrolled in courses.");
    }

    if (course._count.enrollments >= course.capacity) {
      throw new BadRequestException(
        `Course "${course.title}" has reached its capacity of ${course.capacity}.`,
      );
    }

    const existing = await this.prisma.enrollment.findUnique({
      where: { courseId_studentId: { courseId: dto.courseId, studentId: dto.studentId } },
    });
    if (existing) {
      throw new ConflictException("Student is already enrolled in this course.");
    }

    return this.prisma.enrollment.create({
      data: { courseId: dto.courseId, studentId: dto.studentId },
      include: {
        course: { select: { id: true, code: true, title: true } },
        student: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
