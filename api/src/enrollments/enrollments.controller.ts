import { Body, Controller, Get, Post, Query, UsePipes } from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Public, Roles } from "../auth/decorators/roles.decorator";
import { CourseCapacityPipe, type CourseCapacityInput } from "../common/pipes/course-capacity.pipe";
import { EnrollStudentDto } from "../common/dto/enrollment.dto";
import { EnrollmentsService } from "./enrollments.service";

@ApiTags("enrollments")
@ApiCookieAuth()
@Controller("enrollments")
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  @Roles("ADMIN")
  @ApiOperation({ summary: "List enrollments, optionally filtered by courseId" })
  @ApiResponse({ status: 200, description: "Enrollment list" })
  list(@Query("courseId") courseId?: string) {
    return this.enrollmentsService.list(courseId);
  }

  @Post()
  @Roles("ADMIN")
  @ApiOperation({ summary: "Enroll a student in a course" })
  @ApiResponse({ status: 201, description: "Enrollment created" })
  @ApiResponse({ status: 400, description: "Course full or student already enrolled" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  enroll(@Body() dto: EnrollStudentDto) {
    return this.enrollmentsService.enroll(dto);
  }

  @Post("capacity-check")
  @Public()
  @UsePipes(new CourseCapacityPipe())
  @ApiOperation({ summary: "Check course capacity (public)" })
  @ApiResponse({ status: 201, description: "Capacity check result" })
  checkCapacity(@Body() body: CourseCapacityInput) {
    return {
      action: "capacityCheck",
      payload: body,
    };
  }
}
