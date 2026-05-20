import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

export type CourseCapacityInput = {
  capacity: number;
  enrolledCount: number;
};

@Injectable()
export class CourseCapacityPipe implements PipeTransform<CourseCapacityInput, CourseCapacityInput> {
  transform(value: CourseCapacityInput): CourseCapacityInput {
    if (value.enrolledCount >= value.capacity) {
      throw new BadRequestException("Course capacity has been reached.");
    }

    return value;
  }
}
