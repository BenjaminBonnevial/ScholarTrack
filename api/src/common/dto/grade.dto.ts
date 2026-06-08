import { Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

export class CreateGradeDto {
  @IsUUID()
  courseId!: string;

  @IsString()
  @MinLength(1)
  studentId!: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  evaluationType?: string;

  @Type(() => Number)
  @Min(0)
  @Max(20)
  score!: number;
}

export class UpdateGradeDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  evaluationType?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(20)
  score?: number;
}

export class GradeImportRowDto {
  @IsUUID()
  courseId!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  studentId?: string;

  @IsOptional()
  @IsEmail()
  studentEmail?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  evaluationType?: string;

  @Type(() => Number)
  @Min(0)
  @Max(20)
  score!: number;
}

export class GradeImportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeImportRowDto)
  rows!: GradeImportRowDto[];
}
