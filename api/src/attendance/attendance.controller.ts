import { Body, Controller, Post } from "@nestjs/common";
import { BulkAttendanceDto, CreateCourseSessionDto } from "../common/dto/attendance.dto";
import { AttendanceService } from "./attendance.service";

@Controller("attendance")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post("sessions")
  createSession(@Body() dto: CreateCourseSessionDto) {
    return this.attendanceService.createSession(dto);
  }

  @Post("records")
  recordBulk(@Body() dto: BulkAttendanceDto) {
    return this.attendanceService.recordBulk(dto);
  }
}
