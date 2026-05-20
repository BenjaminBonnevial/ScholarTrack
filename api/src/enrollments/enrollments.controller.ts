import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { Public } from "../auth/decorators/roles.decorator";
import { CourseCapacityPipe, type CourseCapacityInput } from "../common/pipes/course-capacity.pipe";
import { EnrollStudentDto } from "../common/dto/enrollment.dto";
import { EnrollmentsService } from "./enrollments.service";

@Controller("enrollments")
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  enroll(@Body() dto: EnrollStudentDto) {
    return this.enrollmentsService.enroll(dto);
  }

  @Post("capacity-check")
  @Public()
  @UsePipes(new CourseCapacityPipe())
  checkCapacity(@Body() body: CourseCapacityInput) {
    return {
      action: "capacityCheck",
      payload: body,
    };
  }
}
