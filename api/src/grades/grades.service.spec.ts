import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { GradesService } from "./grades.service";
import { PrismaService } from "../prisma/prisma.service";

const mockPrisma = {
  grade: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  enrollment: {
    findUnique: jest.fn(),
  },
  course: {
    findUnique: jest.fn(),
  },
  courseEvaluationWeight: {
    findMany: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
};

const adminActor = {
  user: { id: "admin-id", name: "Admin", email: "admin@test.com" },
  session: { id: "session-id" },
  role: "ADMIN",
} as any;

const teacherActor = {
  user: { id: "teacher-id", name: "Teacher", email: "teacher@test.com" },
  session: { id: "session-id" },
  role: "TEACHER",
} as any;

describe("GradesService", () => {
  let service: GradesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GradesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<GradesService>(GradesService);
  });

  describe("create", () => {
    it("throws BadRequestException when student is not enrolled", async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ courseId: "c1", studentId: "s1", score: 15 }, adminActor),
      ).rejects.toThrow(BadRequestException);
    });

    it("throws ForbiddenException when teacher records grade for another teacher course", async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue({ id: "e1" });
      mockPrisma.course.findUnique.mockResolvedValue({ id: "c1", teacherId: "other-teacher" });

      await expect(
        service.create({ courseId: "c1", studentId: "s1", score: 15 }, teacherActor),
      ).rejects.toThrow(ForbiddenException);
    });

    it("creates a grade and returns weighted average", async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue({ id: "e1" });
      mockPrisma.grade.create.mockResolvedValue({
        id: "g1",
        courseId: "c1",
        studentId: "s1",
        evaluationType: "EXAM",
        score: 15,
        recordedById: "admin-id",
        recordedAt: new Date(),
        updatedAt: new Date(),
      });
      mockPrisma.grade.findMany.mockResolvedValue([{ score: 15, evaluationType: "EXAM" }]);
      mockPrisma.courseEvaluationWeight.findMany.mockResolvedValue([]);

      const result = await service.create(
        { courseId: "c1", studentId: "s1", score: 15 },
        adminActor,
      );

      expect(result.weightedAverage).toBe(15);
      expect(mockPrisma.grade.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ score: 15 }) }),
      );
    });
  });

  describe("update", () => {
    it("throws NotFoundException when grade does not exist", async () => {
      mockPrisma.grade.findUnique.mockResolvedValue(null);

      await expect(service.update("nonexistent", { score: 18 }, adminActor)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("throws ForbiddenException when teacher updates grade they did not record", async () => {
      mockPrisma.grade.findUnique.mockResolvedValue({
        id: "g1",
        courseId: "c1",
        studentId: "s1",
        recordedById: "other-teacher",
      });

      await expect(service.update("g1", { score: 18 }, teacherActor)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("calculateWeightedAverage", () => {
    it("returns null when no grades exist", async () => {
      mockPrisma.grade.findMany.mockResolvedValue([]);
      mockPrisma.courseEvaluationWeight.findMany.mockResolvedValue([]);

      const avg = await service.calculateWeightedAverage("c1", "s1");
      expect(avg).toBeNull();
    });

    it("computes a simple average when no weights are configured", async () => {
      mockPrisma.grade.findMany.mockResolvedValue([
        { score: 10, evaluationType: "TP" },
        { score: 20, evaluationType: "EXAM" },
      ]);
      mockPrisma.courseEvaluationWeight.findMany.mockResolvedValue([]);

      const avg = await service.calculateWeightedAverage("c1", "s1");
      expect(avg).toBe(15);
    });

    it("computes a weighted average when weights are configured", async () => {
      mockPrisma.grade.findMany.mockResolvedValue([
        { score: 10, evaluationType: "TP" },
        { score: 20, evaluationType: "EXAM" },
      ]);
      mockPrisma.courseEvaluationWeight.findMany.mockResolvedValue([
        { type: "TP", weight: 1 },
        { type: "EXAM", weight: 3 },
      ]);

      // (10*1 + 20*3) / (1+3) = 70/4 = 17.5
      const avg = await service.calculateWeightedAverage("c1", "s1");
      expect(avg).toBe(17.5);
    });
  });

  describe("importCsv", () => {
    it("returns error report and does not persist when a row has no enrollment", async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue(null);

      const result = await service.importCsv(
        { rows: [{ courseId: "c1", studentId: "s1", score: 15 }] },
        adminActor,
      );

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it("runs a transaction when all rows are valid", async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue({ id: "e1" });
      mockPrisma.$transaction.mockResolvedValue([]);

      const result = await service.importCsv(
        { rows: [{ courseId: "c1", studentId: "s1", score: 15 }] },
        adminActor,
      );

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it("resolves student by email when studentId is missing", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "s1" });
      mockPrisma.enrollment.findUnique.mockResolvedValue({ id: "e1" });
      mockPrisma.$transaction.mockResolvedValue([]);

      const result = await service.importCsv(
        { rows: [{ courseId: "c1", studentEmail: "student@test.com", score: 12 }] },
        adminActor,
      );

      expect(result.success).toBe(true);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: "student@test.com" } }),
      );
    });

    it("records an error when student email is not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.importCsv(
        { rows: [{ courseId: "c1", studentEmail: "ghost@test.com", score: 12 }] },
        adminActor,
      );

      expect(result.success).toBe(false);
      expect(result.errors[0].reason).toContain("ghost@test.com");
    });
  });
});
