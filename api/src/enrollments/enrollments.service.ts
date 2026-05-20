import { Injectable } from "@nestjs/common";
import { EnrollStudentDto } from "../common/dto/enrollment.dto";

@Injectable()
export class EnrollmentsService {
  enroll(dto: EnrollStudentDto) {
    return { action: "enrollStudent", payload: dto };
  }
}
