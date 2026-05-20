import { Body, Controller, Param, Patch, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { CreateGradeDto, GradeImportDto, UpdateGradeDto } from "../common/dto/grade.dto";
import { IdParamDto } from "../common/dto/id-param.dto";
import { GradesService } from "./grades.service";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("grades")
@Roles("TEACHER", "ADMIN")
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  create(@Body() dto: CreateGradeDto, @Req() req: Request) {
    return this.gradesService.create(dto, req.auth!);
  }

  @Patch(":id")
  update(@Param() params: IdParamDto, @Body() dto: UpdateGradeDto, @Req() req: Request) {
    return this.gradesService.update(params.id, dto, req.auth!);
  }

  @Post("import")
  importCsv(@Body() dto: GradeImportDto, @Req() req: Request) {
    return this.gradesService.importCsv(dto, req.auth!);
  }
}
