import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ClassroomsService } from "./classrooms.service";
import { PrismaService } from "../prisma/prisma.service";

const classroomStub = {
  id: "cr1",
  name: "Group A",
  description: null,
  semesterId: "s1",
  semester: { id: "s1", name: "Fall 2026" },
  students: [],
  courses: [],
  _count: { students: 0, courses: 0 },
};

const mockPrisma = {
  classroom: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    updateMany: jest.fn(),
    update: jest.fn(),
  },
};

describe("ClassroomsService", () => {
  let service: ClassroomsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassroomsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<ClassroomsService>(ClassroomsService);
  });

  describe("create", () => {
    it("should create a classroom", async () => {
      mockPrisma.classroom.create.mockResolvedValue(classroomStub);
      const result = await service.create({ name: "Group A", semesterId: "s1" });
      expect(result.name).toBe("Group A");
      expect(mockPrisma.classroom.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("list", () => {
    it("should return all classrooms", async () => {
      mockPrisma.classroom.findMany.mockResolvedValue([classroomStub]);
      const result = await service.list();
      expect(result).toHaveLength(1);
    });
  });

  describe("get", () => {
    it("should return classroom when found", async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue(classroomStub);
      const result = await service.get("cr1");
      expect(result.id).toBe("cr1");
    });

    it("should throw NotFoundException when not found", async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue(null);
      await expect(service.get("missing")).rejects.toThrow(NotFoundException);
    });
  });

  describe("getMyClassroom", () => {
    it("should return null when student has no classroom", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ classroomId: null });
      const result = await service.getMyClassroom("student1");
      expect(result).toBeNull();
    });

    it("should return classroom when student has one", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ classroomId: "cr1" });
      mockPrisma.classroom.findUnique.mockResolvedValue(classroomStub);
      const result = await service.getMyClassroom("student1");
      expect(result?.id).toBe("cr1");
    });
  });

  describe("update", () => {
    it("should update and return the classroom", async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue(classroomStub);
      const updated = { ...classroomStub, name: "Group B" };
      mockPrisma.classroom.update.mockResolvedValue(updated);
      const result = await service.update("cr1", { name: "Group B" });
      expect(result.name).toBe("Group B");
    });

    it("should throw when classroom not found", async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue(null);
      await expect(service.update("missing", { name: "X" })).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should delete the classroom", async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue(classroomStub);
      mockPrisma.classroom.delete.mockResolvedValue(classroomStub);
      await expect(service.remove("cr1")).resolves.toBeDefined();
    });

    it("should throw when classroom not found", async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue(null);
      await expect(service.remove("missing")).rejects.toThrow(NotFoundException);
    });
  });

  describe("assignStudents", () => {
    it("should assign students to classroom", async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue(classroomStub);
      mockPrisma.user.findMany.mockResolvedValue([{ id: "s1", role: "STUDENT" }]);
      mockPrisma.user.updateMany.mockResolvedValue({ count: 1 });
      // second get() call after update
      mockPrisma.classroom.findUnique.mockResolvedValue({
        ...classroomStub,
        students: [{ id: "s1", name: "Alice", email: "alice@test.com" }],
      });
      const result = await service.assignStudents("cr1", { studentIds: ["s1"] });
      expect(result.students).toHaveLength(1);
    });

    it("should throw BadRequestException when non-student user included", async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue(classroomStub);
      mockPrisma.user.findMany.mockResolvedValue([{ id: "t1", role: "TEACHER" }]);
      await expect(service.assignStudents("cr1", { studentIds: ["t1"] })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("removeStudent", () => {
    it("should remove a student from classroom", async () => {
      // first get() check
      mockPrisma.classroom.findUnique.mockResolvedValueOnce(classroomStub);
      mockPrisma.user.findUnique.mockResolvedValue({ id: "s1", classroomId: "cr1" });
      mockPrisma.user.update.mockResolvedValue({});
      // second get() after update
      mockPrisma.classroom.findUnique.mockResolvedValueOnce(classroomStub);
      await expect(service.removeStudent("cr1", "s1")).resolves.toBeDefined();
    });

    it("should throw NotFoundException when student not in classroom", async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue(classroomStub);
      mockPrisma.user.findUnique.mockResolvedValue({ id: "s1", classroomId: "other" });
      await expect(service.removeStudent("cr1", "s1")).rejects.toThrow(NotFoundException);
    });
  });
});
