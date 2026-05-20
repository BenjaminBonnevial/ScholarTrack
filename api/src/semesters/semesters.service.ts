import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PaginationDto } from "../common/dto/pagination.dto";
import { CreateSemesterDto, UpdateSemesterDto } from "../common/dto/semester.dto";

@Injectable()
export class SemestersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Create a semester, rejecting duplicate names. */
  async create(dto: CreateSemesterDto) {
    const existing = await this.prisma.semester.findUnique({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException(`A semester named "${dto.name}" already exists.`);
    }
    return this.prisma.semester.create({ data: dto });
  }

  /** List semesters with pagination. */
  async list(query: PaginationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, total] = await Promise.all([
      this.prisma.semester.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startDate: "desc" },
      }),
      this.prisma.semester.count(),
    ]);
    return { items, total, page, limit };
  }

  /** Get a single semester by id, including its courses. */
  async get(id: string) {
    const semester = await this.prisma.semester.findUnique({
      where: { id },
      include: { courses: { select: { id: true, code: true, title: true } } },
    });
    if (!semester) {
      throw new NotFoundException(`Semester ${id} not found.`);
    }
    return semester;
  }

  async update(id: string, dto: UpdateSemesterDto) {
    await this.get(id);
    if (dto.name) {
      const clash = await this.prisma.semester.findFirst({
        where: { name: dto.name, NOT: { id } },
      });
      if (clash) {
        throw new ConflictException(`A semester named "${dto.name}" already exists.`);
      }
    }
    return this.prisma.semester.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.get(id);
    return this.prisma.semester.delete({ where: { id } });
  }
}
