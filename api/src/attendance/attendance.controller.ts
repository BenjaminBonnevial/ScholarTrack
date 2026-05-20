import { Body, Controller, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { BulkAttendanceDto, CreateCourseSessionDto } from "../common/dto/attendance.dto";
import { AttendanceService } from "./attendance.service";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("attendance")
@Roles("TEACHER", "ADMIN")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post("sessions")
  createSession(@Body() dto: CreateCourseSessionDto, @Req() req: Request) {
    return this.attendanceService.createSession(dto, req.auth!);
  }

  @Post("records")
  recordBulk(@Body() dto: BulkAttendanceDto, @Req() req: Request) {
    return this.attendanceService.recordBulk(dto, req.auth!);
  }
}
