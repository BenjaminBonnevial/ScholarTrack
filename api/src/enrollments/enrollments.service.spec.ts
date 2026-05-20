import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { EnrollmentsService } from "./enrollments.service";
import { PrismaService } from "../prisma/prisma.service";

const mockPrisma = {
  course: { findUnique: jest.fn() },
  user: { findUnique: jest.fn() },
  enrollment: { findUnique: jest.fn(), create: jest.fn() },
};

const course = {
  id: "c1",
  title: "Math",
  capacity: 2,
  _count: { enrollments: 1 },
};

const student = { id: "s1", name: "Alice", email: "alice@test.com", role: "STUDENT" };

describe("EnrollmentsService", () => {
  let service: EnrollmentsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnrollmentsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<EnrollmentsService>(EnrollmentsService);
  });

  it("throws NotFoundException when course does not exist", async () => {
    mockPrisma.course.findUnique.mockResolvedValue(null);
    await expect(service.enroll({ courseId: "c1", studentId: "s1" })).rejects.toThrow(
      NotFoundException,
    );
  });

  it("throws NotFoundException when student does not exist", async () => {
    mockPrisma.course.findUnique.mockResolvedValue(course);
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(service.enroll({ courseId: "c1", studentId: "s1" })).rejects.toThrow(
      NotFoundException,
    );
  });

  it("throws BadRequestException when user is not a student", async () => {
    mockPrisma.course.findUnique.mockResolvedValue(course);
    mockPrisma.user.findUnique.mockResolvedValue({ ...student, role: "TEACHER" });
    await expect(service.enroll({ courseId: "c1", studentId: "s1" })).rejects.toThrow(
      BadRequestException,
    );
  });

  it("throws BadRequestException when course is full", async () => {
    mockPrisma.course.findUnique.mockResolvedValue({ ...course, _count: { enrollments: 2 } });
    mockPrisma.user.findUnique.mockResolvedValue(student);
    await expect(service.enroll({ courseId: "c1", studentId: "s1" })).rejects.toThrow(
      BadRequestException,
    );
  });

  it("throws ConflictException when student is already enrolled", async () => {
    mockPrisma.course.findUnique.mockResolvedValue(course);
    mockPrisma.user.findUnique.mockResolvedValue(student);
    mockPrisma.enrollment.findUnique.mockResolvedValue({ id: "e1" });
    await expect(service.enroll({ courseId: "c1", studentId: "s1" })).rejects.toThrow(
      ConflictException,
    );
  });

  it("creates enrollment when all checks pass", async () => {
    mockPrisma.course.findUnique.mockResolvedValue(course);
    mockPrisma.user.findUnique.mockResolvedValue(student);
    mockPrisma.enrollment.findUnique.mockResolvedValue(null);
    mockPrisma.enrollment.create.mockResolvedValue({
      id: "e1",
      courseId: "c1",
      studentId: "s1",
      course: { id: "c1", code: "MATH", title: "Math" },
      student: { id: "s1", name: "Alice", email: "alice@test.com" },
    });
    const result = await service.enroll({ courseId: "c1", studentId: "s1" });
    expect(result.id).toBe("e1");
  });
});
