import { Body, Controller, Post } from "@nestjs/common";
import { EnrollStudentDto } from "../common/dto/enrollment.dto";
import { EnrollmentsService } from "./enrollments.service";

@Controller("enrollments")
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  enroll(@Body() dto: EnrollStudentDto) {
    return this.enrollmentsService.enroll(dto);
  }
}
