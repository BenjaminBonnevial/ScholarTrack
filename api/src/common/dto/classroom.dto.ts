import { IsArray, IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class CreateClassroomDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  semesterId?: string;
}

export class UpdateClassroomDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  semesterId?: string;
}

export class AssignStudentsDto {
  @IsArray()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  studentIds!: string[];
}
