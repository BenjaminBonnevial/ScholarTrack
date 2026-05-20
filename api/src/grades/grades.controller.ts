import { Body, Controller, Param, Patch, Post } from "@nestjs/common";
import { CreateGradeDto, GradeImportDto, UpdateGradeDto } from "../common/dto/grade.dto";
import { IdParamDto } from "../common/dto/id-param.dto";
import { GradesService } from "./grades.service";

@Controller("grades")
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  create(@Body() dto: CreateGradeDto) {
    return this.gradesService.create(dto);
  }

  @Patch(":id")
  update(@Param() params: IdParamDto, @Body() dto: UpdateGradeDto) {
    return this.gradesService.update(params.id, dto);
  }

  @Post("import")
  importCsv(@Body() dto: GradeImportDto) {
    return this.gradesService.importCsv(dto);
  }
}
