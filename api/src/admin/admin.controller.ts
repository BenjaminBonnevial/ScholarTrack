import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { Roles } from "../auth/decorators/roles.decorator";
import { BulkEnrollmentImportDto, SemesterReportQueryDto, StatsQueryDto } from "./admin.dto";

@Controller("admin")
@Roles("ADMIN")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("enrollments/import")
  importEnrollments(@Body() dto: BulkEnrollmentImportDto) {
    return this.adminService.importEnrollments(dto);
  }

  @Get("reports/semester")
  exportSemesterReport(@Query() query: SemesterReportQueryDto) {
    return this.adminService.exportSemesterReport(query);
  }

  @Get("stats")
  getStats(@Query() query: StatsQueryDto) {
    return this.adminService.getStats(query);
  }
}
