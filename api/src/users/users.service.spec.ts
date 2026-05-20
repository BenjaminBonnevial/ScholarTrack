import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "../prisma/prisma.service";

// Mock the auth module to avoid real Better Auth calls
jest.mock("../auth", () => ({
  auth: {
    api: {
      signUpEmail: jest.fn(),
    },
  },
}));

import { auth } from "../auth";

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    findUniqueOrThrow: jest.fn(),
  },
};

const userFixture = {
  id: "u1",
  name: "Alice",
  email: "alice@test.com",
  role: "STUDENT",
  createdAt: new Date(),
};

describe("UsersService", () => {
  let service: UsersService;
  const signUpEmail = auth.api.signUpEmail as jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  describe("create", () => {
    it("throws ConflictException when email already exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(userFixture);
      await expect(
        service.create({ name: "Alice", email: "alice@test.com", role: "STUDENT", password: "pass1234" }),
      ).rejects.toThrow(ConflictException);
    });

    it("creates a user with default STUDENT role", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      signUpEmail.mockResolvedValue({ user: { id: "u1" } });
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue(userFixture);

      const result = await service.create({
        name: "Alice",
        email: "alice@test.com",
        role: "STUDENT",
        password: "password123",
      });

      expect(signUpEmail).toHaveBeenCalled();
      expect(result).toEqual(userFixture);
      // No role update needed for STUDENT (default)
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it("updates role to ADMIN after creation", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      signUpEmail.mockResolvedValue({ user: { id: "u1" } });
      mockPrisma.user.update.mockResolvedValue({ ...userFixture, role: "ADMIN" });
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({ ...userFixture, role: "ADMIN" });

      await service.create({
        name: "Admin",
        email: "admin@test.com",
        role: "ADMIN",
        password: "password123",
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { role: "ADMIN" } }),
      );
    });

    it("throws ConflictException when Better Auth returns no user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      signUpEmail.mockResolvedValue(null);

      await expect(
        service.create({ name: "X", email: "x@test.com", role: "STUDENT", password: "pass1234" }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("list", () => {
    it("returns paginated users", async () => {
      mockPrisma.user.findMany.mockResolvedValue([userFixture]);
      mockPrisma.user.count.mockResolvedValue(1);
      const result = await service.list({ page: 1, limit: 10 });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it("filters by role", async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);
      await service.list({ role: "TEACHER" });
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ role: "TEACHER" }) }),
      );
    });

    it("filters by search term", async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);
      await service.list({ search: "alice" });
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) }),
      );
    });
  });

  describe("updateRole", () => {
    it("throws NotFoundException when user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.updateRole("nonexistent", { role: "TEACHER" })).rejects.toThrow(
        NotFoundException,
      );
    });

    it("updates and returns the user role", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(userFixture);
      mockPrisma.user.update.mockResolvedValue({ ...userFixture, role: "TEACHER" });
      const result = await service.updateRole("u1", { role: "TEACHER" });
      expect(result.role).toBe("TEACHER");
    });
  });
});
