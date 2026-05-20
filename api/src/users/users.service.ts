import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { auth } from "../auth";
import { CreateUserDto, UpdateUserRoleDto } from "../common/dto/user.dto";
import { UserListDto } from "../common/dto/user-list.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a user via Better Auth so the password is hashed and the Account
   * record is created, then update the role if it differs from the default.
   */
  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException(`Email ${dto.email} is already in use.`);
    }

    const result = await auth.api.signUpEmail({
      body: { email: dto.email, password: dto.password, name: dto.name },
    });

    if (!result?.user) {
      throw new ConflictException("User creation failed.");
    }

    if (dto.role && dto.role !== "STUDENT") {
      await this.prisma.user.update({
        where: { id: result.user.id },
        data: { role: dto.role },
      });
    }

    return this.prisma.user.findUniqueOrThrow({
      where: { id: result.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }

  /** List users with optional role filter and search on name/email. */
  async list(query: UserListDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" as const } },
              { email: { contains: query.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async updateRole(id: string, dto: UpdateUserRoleDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found.`);
    }
    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: { id: true, name: true, email: true, role: true },
    });
  }
}
