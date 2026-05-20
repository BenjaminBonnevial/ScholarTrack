import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthSessionData } from "../auth/auth.types";
import { CourseFilterDto } from "../common/dto/course-filter.dto";
import { CreateCourseDto, UpdateCourseDto } from "../common/dto/course.dto";

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Create a course and optional evaluation weights. */
  async create(dto: CreateCourseDto, actor: AuthSessionData) {
    const role = (actor as unknown as { role: string }).role;
    const teacherId = role === "TEACHER" ? actor.user.id : (dto.teacherId ?? actor.user.id);

    return this.prisma.course.create({
      data: {
        code: dto.code,
        title: dto.title,
        description: dto.description,
        capacity: dto.capacity,
        teacherId,
        semesterId: dto.semesterId,
        weights: dto.weights?.length
          ? { create: dto.weights.map((w) => ({ type: w.type, weight: w.weight })) }
          : undefined,
      },
      include: { weights: true, teacher: { select: { id: true, name: true } } },
    });
  }

  /** List courses — teachers only see their own, admins and students see all. */
  async list(query: CourseFilterDto, actor: AuthSessionData) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const role = (actor as unknown as { role: string }).role;

    const where = {
      ...(role === "TEACHER" ? { teacherId: actor.user.id } : {}),
      ...(query.teacherId ? { teacherId: query.teacherId } : {}),
      ...(query.semesterId ? { semesterId: query.semesterId } : {}),
      ...(query.query
        ? {
            OR: [
              { title: { contains: query.query, mode: "insensitive" as const } },
              { code: { contains: query.query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          weights: true,
          teacher: { select: { id: true, name: true } },
          semester: { select: { id: true, name: true } },
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.course.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  /** Get a single course with weights, teacher and enrollment count. */
  async get(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        weights: true,
        teacher: { select: { id: true, name: true, email: true } },
        semester: true,
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) {
      throw new NotFoundException(`Course ${id} not found.`);
    }
    return course;
  }

  /** Update a course. Teachers can only update their own courses. */
  async update(id: string, dto: UpdateCourseDto, actor: AuthSessionData) {
    const course = await this.get(id);
    const role = (actor as unknown as { role: string }).role;
    if (role === "TEACHER" && course.teacherId !== actor.user.id) {
      throw new ForbiddenException("You can only update your own courses.");
    }

    const { weights, ...rest } = dto;

    return this.prisma.course.update({
      where: { id },
      data: {
        ...rest,
        ...(weights !== undefined
          ? {
              weights: {
                deleteMany: {},
                create: weights.map((w) => ({ type: w.type, weight: w.weight })),
              },
            }
          : {}),
      },
      include: { weights: true },
    });
  }

  /** Delete a course. Teachers can only delete their own courses. */
  async remove(id: string, actor: AuthSessionData) {
    const course = await this.get(id);
    const role = (actor as unknown as { role: string }).role;
    if (role === "TEACHER" && course.teacherId !== actor.user.id) {
      throw new ForbiddenException("You can only delete your own courses.");
    }
    return this.prisma.course.delete({ where: { id } });
  }
}
