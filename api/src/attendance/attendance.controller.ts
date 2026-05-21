import { Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { BulkAttendanceDto, CreateCourseSessionDto } from "../common/dto/attendance.dto";
import { AttendanceService } from "./attendance.service";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("attendance")
@ApiCookieAuth()
@Controller("attendance")
@Roles("TEACHER", "ADMIN")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get("sessions")
  @ApiOperation({ summary: "List course sessions" })
  @ApiResponse({ status: 200, description: "Session list" })
  listSessions(@Query("courseId") courseId?: string) {
    return this.attendanceService.listSessions(courseId);
  }

  @Post("sessions")
  @ApiOperation({ summary: "Create an attendance session for a course" })
  @ApiResponse({ status: 201, description: "Session created" })
  @ApiResponse({ status: 403, description: "Forbidden — not your course" })
  @ApiResponse({ status: 404, description: "Course not found" })
  createSession(@Body() dto: CreateCourseSessionDto, @Req() req: Request) {
    return this.attendanceService.createSession(dto, req.auth!);
  }

  @Post("records")
  @ApiOperation({ summary: "Record bulk attendance — updates atRisk flag" })
  @ApiResponse({ status: 201, description: "Records saved" })
  @ApiResponse({ status: 403, description: "Forbidden — not your course" })
  @ApiResponse({ status: 404, description: "Session not found" })
  recordBulk(@Body() dto: BulkAttendanceDto, @Req() req: Request) {
    return this.attendanceService.recordBulk(dto, req.auth!);
  }
}
