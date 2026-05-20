import { IsUUID } from "class-validator";

export class EnrollStudentDto {
  @IsUUID()
  courseId!: string;

  @IsUUID()
  studentId!: string;
}
