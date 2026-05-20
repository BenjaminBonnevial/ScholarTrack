import { Body, Controller, Post, Query } from "@nestjs/common";
import { PaginationDto } from "../common/dto/pagination.dto";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("enrollments/import")
  importEnrollments(@Body() body: unknown) {
    return this.adminService.importEnrollments(body);
  }

  @Post("reports/semester")
  exportSemesterReport(@Query() query: PaginationDto) {
    return this.adminService.exportSemesterReport(query);
  }
}
