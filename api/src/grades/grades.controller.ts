import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { CreateGradeDto, GradeImportDto, UpdateGradeDto } from "../common/dto/grade.dto";
import { IdParamDto } from "../common/dto/id-param.dto";
import { GradesService } from "./grades.service";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("grades")
@ApiCookieAuth()
@Controller("grades")
@Roles("TEACHER", "ADMIN")
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get()
  @ApiOperation({ summary: "List grades with optional course/student filter" })
  @ApiResponse({ status: 200, description: "Grade list" })
  list(@Query("courseId") courseId?: string, @Query("studentId") studentId?: string) {
    return this.gradesService.list({ courseId, studentId });
  }

  @Post()
  @ApiOperation({ summary: "Record a grade — student must be enrolled" })
  @ApiResponse({ status: 201, description: "Grade recorded with weighted average" })
  @ApiResponse({ status: 400, description: "Student not enrolled" })
  @ApiResponse({ status: 403, description: "Forbidden — not your course" })
  create(@Body() dto: CreateGradeDto, @Req() req: Request) {
    return this.gradesService.create(dto, req.auth!);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a grade" })
  @ApiResponse({ status: 200, description: "Grade updated" })
  @ApiResponse({ status: 403, description: "Forbidden — you did not record this grade" })
  @ApiResponse({ status: 404, description: "Grade not found" })
  update(@Param() params: IdParamDto, @Body() dto: UpdateGradeDto, @Req() req: Request) {
    return this.gradesService.update(params.id, dto, req.auth!);
  }

  @Post("import")
  @ApiOperation({ summary: "Bulk import grades (all-or-nothing transaction)" })
  @ApiResponse({ status: 201, description: "All grades imported or error report returned" })
  importCsv(@Body() dto: GradeImportDto, @Req() req: Request) {
    return this.gradesService.importCsv(dto, req.auth!);
  }
}
