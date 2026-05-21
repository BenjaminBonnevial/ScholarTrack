import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  AssignStudentsDto,
  CreateClassroomDto,
  UpdateClassroomDto,
} from "../common/dto/classroom.dto";

@Injectable()
export class ClassroomsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClassroomDto) {
    return this.prisma.classroom.create({
      data: {
        name: dto.name,
        description: dto.description,
        semesterId: dto.semesterId,
      },
      include: {
        semester: { select: { id: true, name: true } },
        _count: { select: { students: true, courses: true } },
      },
    });
  }

  async list() {
    return this.prisma.classroom.findMany({
      include: {
        semester: { select: { id: true, name: true } },
        _count: { select: { students: true, courses: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  async get(id: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id },
      include: {
        semester: { select: { id: true, name: true } },
        students: { select: { id: true, name: true, email: true } },
        courses: {
          include: {
            teacher: { select: { id: true, name: true } },
            semester: { select: { id: true, name: true } },
            _count: { select: { enrollments: true } },
          },
        },
      },
    });
    if (!classroom) throw new NotFoundException(`Classroom ${id} not found.`);
    return classroom;
  }

  async getMyClassroom(studentId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { classroomId: true },
    });
    if (!user?.classroomId) return null;
    return this.get(user.classroomId);
  }

  async update(id: string, dto: UpdateClassroomDto) {
    await this.get(id);
    return this.prisma.classroom.update({
      where: { id },
      data: dto,
      include: {
        semester: { select: { id: true, name: true } },
        _count: { select: { students: true, courses: true } },
      },
    });
  }

  async remove(id: string) {
    await this.get(id);
    return this.prisma.classroom.delete({ where: { id } });
  }

  async assignStudents(classroomId: string, dto: AssignStudentsDto) {
    await this.get(classroomId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: dto.studentIds } },
      select: { id: true, role: true },
    });
    const nonStudents = users.filter((u) => u.role !== "STUDENT");
    if (nonStudents.length) {
      throw new BadRequestException(
        "Only users with role STUDENT can be assigned to a classroom.",
      );
    }
    await this.prisma.user.updateMany({
      where: { id: { in: dto.studentIds } },
      data: { classroomId },
    });
    return this.get(classroomId);
  }

  async removeStudent(classroomId: string, studentId: string) {
    await this.get(classroomId);
    const user = await this.prisma.user.findUnique({ where: { id: studentId } });
    if (!user || user.classroomId !== classroomId) {
      throw new NotFoundException("Student not found in this classroom.");
    }
    await this.prisma.user.update({
      where: { id: studentId },
      data: { classroomId: null },
    });
    return this.get(classroomId);
  }
}
