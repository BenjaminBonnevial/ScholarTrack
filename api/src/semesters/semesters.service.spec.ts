import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { SemestersService } from "./semesters.service";
import { PrismaService } from "../prisma/prisma.service";

const mockPrisma = {
  semester: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const semesterFixture = {
  id: "s1",
  name: "S1 2025",
  startDate: new Date("2025-09-01"),
  endDate: new Date("2026-01-31"),
};

describe("SemestersService", () => {
  let service: SemestersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [SemestersService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<SemestersService>(SemestersService);
  });

  describe("create", () => {
    it("throws ConflictException when name already exists", async () => {
      mockPrisma.semester.findUnique.mockResolvedValue(semesterFixture);
      await expect(service.create(semesterFixture)).rejects.toThrow(ConflictException);
    });

    it("creates and returns the semester", async () => {
      mockPrisma.semester.findUnique.mockResolvedValue(null);
      mockPrisma.semester.create.mockResolvedValue(semesterFixture);
      const result = await service.create(semesterFixture);
      expect(result).toEqual(semesterFixture);
    });
  });

  describe("list", () => {
    it("returns paginated results", async () => {
      mockPrisma.semester.findMany.mockResolvedValue([semesterFixture]);
      mockPrisma.semester.count.mockResolvedValue(1);
      const result = await service.list({ page: 1, limit: 10 });
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
    });
  });

  describe("get", () => {
    it("throws NotFoundException when semester does not exist", async () => {
      mockPrisma.semester.findUnique.mockResolvedValue(null);
      await expect(service.get("nonexistent")).rejects.toThrow(NotFoundException);
    });

    it("returns the semester when found", async () => {
      mockPrisma.semester.findUnique.mockResolvedValue({
        ...semesterFixture,
        courses: [],
      });
      const result = await service.get("s1");
      expect(result.id).toBe("s1");
    });
  });

  describe("update", () => {
    it("throws NotFoundException when semester does not exist", async () => {
      mockPrisma.semester.findUnique.mockResolvedValue(null);
      await expect(service.update("nonexistent", { name: "New" })).rejects.toThrow(
        NotFoundException,
      );
    });

    it("throws ConflictException on duplicate name", async () => {
      mockPrisma.semester.findUnique.mockResolvedValue({ ...semesterFixture, courses: [] });
      mockPrisma.semester.findFirst.mockResolvedValue({ id: "other" });
      await expect(service.update("s1", { name: "Duplicate" })).rejects.toThrow(
        ConflictException,
      );
    });

    it("updates and returns the semester", async () => {
      mockPrisma.semester.findUnique.mockResolvedValue({ ...semesterFixture, courses: [] });
      mockPrisma.semester.findFirst.mockResolvedValue(null);
      mockPrisma.semester.update.mockResolvedValue({ ...semesterFixture, name: "Updated" });
      const result = await service.update("s1", { name: "Updated" });
      expect(result.name).toBe("Updated");
    });
  });

  describe("remove", () => {
    it("throws NotFoundException when semester does not exist", async () => {
      mockPrisma.semester.findUnique.mockResolvedValue(null);
      await expect(service.remove("nonexistent")).rejects.toThrow(NotFoundException);
    });

    it("deletes and returns the semester", async () => {
      mockPrisma.semester.findUnique.mockResolvedValue({ ...semesterFixture, courses: [] });
      mockPrisma.semester.delete.mockResolvedValue(semesterFixture);
      const result = await service.remove("s1");
      expect(result).toEqual(semesterFixture);
    });
  });
});
