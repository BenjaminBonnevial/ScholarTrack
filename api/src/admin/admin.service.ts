import { Injectable } from "@nestjs/common";
import { PaginationDto } from "../common/dto/pagination.dto";

@Injectable()
export class AdminService {
  importEnrollments(payload: unknown) {
    return { action: "importEnrollments", payload };
  }

  exportSemesterReport(query: PaginationDto) {
    return { action: "exportSemesterReport", query };
  }
}
