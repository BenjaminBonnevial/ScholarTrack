import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

export class CourseWeightDto {
  @IsString()
  @MinLength(2)
  type!: string;

  @Type(() => Number)
  @Min(0)
  @Max(100)
  weight!: number;
}

export class CreateCourseDto {
  @IsString()
  @MinLength(2)
  code!: string;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity!: number;

  @IsString()
  @MinLength(1)
  teacherId!: string;

  @IsUUID()
  semesterId!: string;

  @IsOptional()
  @IsUUID()
  classroomId?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CourseWeightDto)
  @ArrayMinSize(1)
  weights?: CourseWeightDto[];
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  code?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  teacherId?: string;

  @IsOptional()
  @IsUUID()
  semesterId?: string;

  @IsOptional()
  @IsUUID()
  classroomId?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CourseWeightDto)
  weights?: CourseWeightDto[];
}
