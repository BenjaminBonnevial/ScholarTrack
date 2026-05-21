import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { Roles } from "../auth/decorators/roles.decorator";
import { BulkEnrollmentImportDto, SemesterReportQueryDto, StatsQueryDto } from "./admin.dto";

@ApiTags("admin")
@ApiCookieAuth()
@Controller("admin")
@Roles("ADMIN")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("enrollments/import")
  @ApiOperation({ summary: "Bulk import enrollments (best-effort, returns per-row errors)" })
  @ApiResponse({ status: 201, description: "Import result with enrolled count and errors" })
  importEnrollments(@Body() dto: BulkEnrollmentImportDto) {
    return this.adminService.importEnrollments(dto);
  }

  @Get("reports/semester")
  @ApiOperation({ summary: "Export semester report with weighted averages per student" })
  @ApiResponse({ status: 200, description: "Semester report" })
  exportSemesterReport(@Query() query: SemesterReportQueryDto) {
    return this.adminService.exportSemesterReport(query);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get aggregated stats (students, courses, avg grade, atRisk count)" })
  @ApiResponse({ status: 200, description: "Stats object" })
  getStats(@Query() query: StatsQueryDto) {
    return this.adminService.getStats(query);
  }
}
