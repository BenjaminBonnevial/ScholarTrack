import { BadRequestException } from "@nestjs/common";
import { CourseCapacityPipe } from "./course-capacity.pipe";

describe("CourseCapacityPipe", () => {
  const pipe = new CourseCapacityPipe();

  it("allows enrollment when there is room", () => {
    expect(pipe.transform({ capacity: 30, enrolledCount: 12 })).toEqual({
      capacity: 30,
      enrolledCount: 12,
    });
  });

  it("rejects enrollment when the course is full", () => {
    expect(() => pipe.transform({ capacity: 30, enrolledCount: 30 })).toThrow(
      BadRequestException,
    );
  });
});
