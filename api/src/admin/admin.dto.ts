import { Type } from "class-transformer";
import { IsArray, IsOptional, IsUUID, ValidateNested } from "class-validator";
import { PaginationDto } from "../common/dto/pagination.dto";

export class BulkEnrollmentRowDto {
  @IsUUID()
  courseId!: string;

  @IsUUID()
  studentId!: string;
}

export class BulkEnrollmentImportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkEnrollmentRowDto)
  rows!: BulkEnrollmentRowDto[];
}

export class SemesterReportQueryDto extends PaginationDto {
  @IsUUID()
  semesterId!: string;
}

export class StatsQueryDto {
  @IsOptional()
  @IsUUID()
  semesterId?: string;
}
