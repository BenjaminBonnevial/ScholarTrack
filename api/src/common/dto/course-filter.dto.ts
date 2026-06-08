import { IsOptional, IsString, IsUUID } from "class-validator";
import { PaginationDto } from "./pagination.dto";

export class CourseFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsUUID()
  semesterId?: string;

  @IsOptional()
  @IsString()
  query?: string;
}
