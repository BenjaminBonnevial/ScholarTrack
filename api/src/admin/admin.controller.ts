import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiProduces, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { AdminService } from "./admin.service";
import { Roles } from "../auth/decorators/roles.decorator";
import { BulkEnrollmentImportDto, SemesterReportQueryDto, StatsQueryDto } from "./admin.dto";

function escapeCsv(value: string | number | boolean | null | undefined): string {
  const str = value === null || value === undefined ? "" : String(value);
  return str.includes(",") || str.includes('"') || str.includes("\n")
    ? `"${str.replace(/"/g, '""')}"`
    : str;
}

@ApiTags("admin")
@ApiCookieAuth()
@Controller("admin")
@Roles("ADMIN")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("enrollments/import")
  @ApiOperation({ summary: "Bulk import enrollments — best-effort, per-row error report" })
  @ApiResponse({ status: 201, description: "Import result with enrolled count and errors" })
  importEnrollments(@Body() dto: BulkEnrollmentImportDto) {
    return this.adminService.importEnrollments(dto);
  }

  @Get("reports/semester")
  @ApiProduces("text/csv")
  @ApiOperation({ summary: "Export semester results as CSV (weighted averages + atRisk per student)" })
  @ApiResponse({ status: 200, description: "CSV file download" })
  @ApiResponse({ status: 404, description: "Semester not found" })
  async exportSemesterReport(@Query() query: SemesterReportQueryDto, @Res() res: Response) {
    const report = await this.adminService.exportSemesterReport(query);
    const header = "studentId,studentName,studentEmail,courseId,courseCode,courseTitle,weightedAverage,atRisk";
    const lines = report.rows.map((r) =>
      [r.studentId, r.studentName, r.studentEmail, r.courseId, r.courseCode, r.courseTitle, r.weightedAverage, r.atRisk]
        .map(escapeCsv)
        .join(","),
    );
    const csv = [header, ...lines].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="semester-${query.semesterId}.csv"`);
    res.send(csv);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get aggregated stats (students, courses, avg grade, atRisk count)" })
  @ApiResponse({ status: 200, description: "Stats object" })
  getStats(@Query() query: StatsQueryDto) {
    return this.adminService.getStats(query);
  }
}
