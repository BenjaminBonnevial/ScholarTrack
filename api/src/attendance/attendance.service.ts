import { Injectable } from "@nestjs/common";
import { BulkAttendanceDto, CreateCourseSessionDto } from "../common/dto/attendance.dto";

@Injectable()
export class AttendanceService {
  createSession(dto: CreateCourseSessionDto) {
    return { action: "createSession", payload: dto };
  }

  recordBulk(dto: BulkAttendanceDto) {
    return { action: "recordAttendance", payload: dto };
  }
}
