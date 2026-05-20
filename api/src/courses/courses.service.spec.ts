import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { CoursesService } from "./courses.service";
import { PrismaService } from "../prisma/prisma.service";

const mockPrisma = {
  course: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const adminActor = { user: { id: "admin-id" }, session: {}, role: "ADMIN" } as any;
const teacherActor = { user: { id: "teacher-id" }, session: {}, role: "TEACHER" } as any;

const courseFixture = {
  id: "c1",
  code: "MATH101",
  title: "Maths",
  description: null,
  capacity: 30,
  teacherId: "teacher-id",
  semesterId: "s1",
  createdAt: new Date(),
  updatedAt: new Date(),
  weights: [],
  teacher: { id: "teacher-id", name: "Prof" },
  semester: { id: "s1", name: "S1" },
  _count: { enrollments: 0 },
};

describe("CoursesService", () => {
  let service: CoursesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoursesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<CoursesService>(CoursesService);
  });

  describe("create", () => {
    it("creates a course and assigns teacherId from actor when TEACHER", async () => {
      mockPrisma.course.create.mockResolvedValue(courseFixture);
      const dto = { code: "MATH101", title: "Maths", capacity: 30, semesterId: "s1" } as any;
      const result = await service.create(dto, teacherActor);
      expect(mockPrisma.course.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ teacherId: "teacher-id" }),
        }),
      );
      expect(result).toEqual(courseFixture);
    });

    it("uses provided teacherId when actor is ADMIN", async () => {
      mockPrisma.course.create.mockResolvedValue(courseFixture);
      const dto = {
        code: "MATH101",
        title: "Maths",
        capacity: 30,
        semesterId: "s1",
        teacherId: "other-teacher",
      } as any;
      await service.create(dto, adminActor);
      expect(mockPrisma.course.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ teacherId: "other-teacher" }),
        }),
      );
    });
  });

  describe("list", () => {
    it("filters by teacherId when actor is TEACHER", async () => {
      mockPrisma.course.findMany.mockResolvedValue([courseFixture]);
      mockPrisma.course.count.mockResolvedValue(1);
      await service.list({} as any, teacherActor);
      expect(mockPrisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ teacherId: "teacher-id" }),
        }),
      );
    });

    it("does not filter by teacherId when actor is ADMIN", async () => {
      mockPrisma.course.findMany.mockResolvedValue([courseFixture]);
      mockPrisma.course.count.mockResolvedValue(1);
      const result = await service.list({} as any, adminActor);
      expect(result.total).toBe(1);
    });
  });

  describe("get", () => {
    it("throws NotFoundException when course does not exist", async () => {
      mockPrisma.course.findUnique.mockResolvedValue(null);
      await expect(service.get("nonexistent")).rejects.toThrow(NotFoundException);
    });

    it("returns the course", async () => {
      mockPrisma.course.findUnique.mockResolvedValue(courseFixture);
      const result = await service.get("c1");
      expect(result.id).toBe("c1");
    });
  });

  describe("update", () => {
    it("throws NotFoundException when course does not exist", async () => {
      mockPrisma.course.findUnique.mockResolvedValue(null);
      await expect(service.update("nonexistent", {}, adminActor)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("throws ForbiddenException when TEACHER updates another teacher course", async () => {
      mockPrisma.course.findUnique.mockResolvedValue({
        ...courseFixture,
        teacherId: "other-teacher",
      });
      await expect(service.update("c1", {}, teacherActor)).rejects.toThrow(ForbiddenException);
    });

    it("updates course successfully", async () => {
      mockPrisma.course.findUnique.mockResolvedValue(courseFixture);
      mockPrisma.course.update.mockResolvedValue({ ...courseFixture, title: "Updated" });
      const result = await service.update("c1", { title: "Updated" }, teacherActor);
      expect(result.title).toBe("Updated");
    });

    it("replaces weights when provided", async () => {
      mockPrisma.course.findUnique.mockResolvedValue(courseFixture);
      mockPrisma.course.update.mockResolvedValue(courseFixture);
      await service.update(
        "c1",
        { weights: [{ type: "EXAM", weight: 70 }, { type: "TP", weight: 30 }] },
        adminActor,
      );
      expect(mockPrisma.course.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ weights: expect.any(Object) }),
        }),
      );
    });
  });

  describe("remove", () => {
    it("throws ForbiddenException when TEACHER removes another teacher course", async () => {
      mockPrisma.course.findUnique.mockResolvedValue({
        ...courseFixture,
        teacherId: "other-teacher",
      });
      await expect(service.remove("c1", teacherActor)).rejects.toThrow(ForbiddenException);
    });

    it("deletes the course", async () => {
      mockPrisma.course.findUnique.mockResolvedValue(courseFixture);
      mockPrisma.course.delete.mockResolvedValue(courseFixture);
      const result = await service.remove("c1", teacherActor);
      expect(result).toEqual(courseFixture);
    });
  });
});
