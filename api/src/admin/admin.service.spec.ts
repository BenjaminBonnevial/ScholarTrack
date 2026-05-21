import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AdminService } from "./admin.service";
import { PrismaService } from "../prisma/prisma.service";
import { GradesService } from "../grades/grades.service";

const mockPrisma = {
  course: { findUnique: jest.fn(), count: jest.fn() },
  enrollment: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  semester: { findUnique: jest.fn() },
  grade: { aggregate: jest.fn() },
};

const mockGradesService = {
  calculateWeightedAverage: jest.fn(),
};

describe("AdminService", () => {
  let service: AdminService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: GradesService, useValue: mockGradesService },
      ],
    }).compile();
    service = module.get<AdminService>(AdminService);
  });

  describe("importEnrollments", () => {
    it("should enroll students successfully", async () => {
      mockPrisma.course.findUnique.mockResolvedValue({
        id: "c1", title: "Math", capacity: 30, _count: { enrollments: 0 },
      });
      mockPrisma.enrollment.findUnique.mockResolvedValue(null);
      mockPrisma.enrollment.create.mockResolvedValue({});

      const result = await service.importEnrollments({
        rows: [{ courseId: "c1", studentId: "s1" }],
      });

      expect(result.enrolled).toBe(1);
      expect(result.errors).toHaveLength(0);
    });

    it("should report error when course not found", async () => {
      mockPrisma.course.findUnique.mockResolvedValue(null);

      const result = await service.importEnrollments({
        rows: [{ courseId: "no-course", studentId: "s1" }],
      });

      expect(result.enrolled).toBe(0);
      expect(result.errors[0].reason).toContain("not found");
    });

    it("should report error when course is at full capacity", async () => {
      mockPrisma.course.findUnique.mockResolvedValue({
        id: "c1", title: "Math", capacity: 1, _count: { enrollments: 1 },
      });

      const result = await service.importEnrollments({
        rows: [{ courseId: "c1", studentId: "s1" }],
      });

      expect(result.errors[0].reason).toContain("capacity");
    });

    it("should report error when student already enrolled", async () => {
      mockPrisma.course.findUnique.mockResolvedValue({
        id: "c1", title: "Math", capacity: 30, _count: { enrollments: 0 },
      });
      mockPrisma.enrollment.findUnique.mockResolvedValue({ id: "existing" });

      const result = await service.importEnrollments({
        rows: [{ courseId: "c1", studentId: "s1" }],
      });

      expect(result.errors[0].reason).toContain("already enrolled");
    });

    it("should report error on unexpected exception", async () => {
      mockPrisma.course.findUnique.mockRejectedValue(new Error("DB error"));

      const result = await service.importEnrollments({
        rows: [{ courseId: "c1", studentId: "s1" }],
      });

      expect(result.errors[0].reason).toContain("Unexpected error");
    });

    it("should handle multiple rows with mixed results", async () => {
      mockPrisma.course.findUnique
        .mockResolvedValueOnce({ id: "c1", title: "Math", capacity: 30, _count: { enrollments: 0 } })
        .mockResolvedValueOnce(null);
      mockPrisma.enrollment.findUnique.mockResolvedValue(null);
      mockPrisma.enrollment.create.mockResolvedValue({});

      const result = await service.importEnrollments({
        rows: [
          { courseId: "c1", studentId: "s1" },
          { courseId: "missing", studentId: "s2" },
        ],
      });

      expect(result.enrolled).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe("exportSemesterReport", () => {
    it("should throw NotFoundException when semester not found", async () => {
      mockPrisma.semester.findUnique.mockResolvedValue(null);

      await expect(service.exportSemesterReport({ semesterId: "no-id" })).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should return semester report with weighted averages", async () => {
      mockPrisma.semester.findUnique.mockResolvedValue({ id: "s1", name: "Fall 2026" });
      mockPrisma.enrollment.findMany.mockResolvedValue([
        {
          courseId: "c1",
          studentId: "st1",
          atRisk: false,
          student: { id: "st1", name: "Alice", email: "alice@test.com" },
          course: { id: "c1", code: "MATH101", title: "Math", weights: [] },
        },
      ]);
      mockPrisma.enrollment.count.mockResolvedValue(1);
      mockGradesService.calculateWeightedAverage.mockResolvedValue(15.5);

      const result = await service.exportSemesterReport({ semesterId: "s1" });

      expect(result.semester).toBe("Fall 2026");
      expect(result.total).toBe(1);
      expect(result.rows[0].weightedAverage).toBe(15.5);
      expect(result.rows[0].atRisk).toBe(false);
    });

    it("should respect pagination parameters", async () => {
      mockPrisma.semester.findUnique.mockResolvedValue({ id: "s1", name: "Fall 2026" });
      mockPrisma.enrollment.findMany.mockResolvedValue([]);
      mockPrisma.enrollment.count.mockResolvedValue(0);

      const result = await service.exportSemesterReport({ semesterId: "s1", page: 2, limit: 10 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });
  });

  describe("getStats", () => {
    it("should return global stats without semesterId filter", async () => {
      mockPrisma.course.count.mockResolvedValue(5);
      mockPrisma.enrollment.count
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(3);
      mockPrisma.grade.aggregate.mockResolvedValue({ _avg: { score: 14.2 }, _count: { id: 50 } });

      const result = await service.getStats({});

      expect(result.totalCourses).toBe(5);
      expect(result.totalEnrollments).toBe(20);
      expect(result.atRiskCount).toBe(3);
      expect(result.averageScore).toBe(14.2);
    });

    it("should filter stats by semesterId", async () => {
      mockPrisma.course.count.mockResolvedValue(2);
      mockPrisma.enrollment.count
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(1);
      mockPrisma.grade.aggregate.mockResolvedValue({ _avg: { score: 12 }, _count: { id: 16 } });

      const result = await service.getStats({ semesterId: "s1" });

      expect(result.totalCourses).toBe(2);
      expect(result.totalGrades).toBe(16);
    });
  });
});
