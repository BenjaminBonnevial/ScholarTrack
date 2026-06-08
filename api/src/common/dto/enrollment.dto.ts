import { IsString, IsUUID, MinLength } from "class-validator";

export class EnrollStudentDto {
  @IsUUID()
  courseId!: string;

  @IsString()
  @MinLength(1)
  studentId!: string;
}
