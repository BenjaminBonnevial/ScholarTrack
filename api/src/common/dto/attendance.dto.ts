import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { AttendanceStatus } from "../enums";

export class CreateCourseSessionDto {
  @IsUUID()
  courseId!: string;

  @Type(() => Date)
  sessionDate!: Date;

  @IsOptional()
  @IsString()
  topic?: string;
}

export class AttendanceRecordDto {
  @IsUUID()
  studentId!: string;

  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;
}

export class BulkAttendanceDto {
  @IsUUID()
  sessionId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records!: AttendanceRecordDto[];
}
