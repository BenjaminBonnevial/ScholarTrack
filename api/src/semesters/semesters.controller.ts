import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { IdParamDto } from "../common/dto/id-param.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { CreateSemesterDto, UpdateSemesterDto } from "../common/dto/semester.dto";
import { SemestersService } from "./semesters.service";

@Controller("semesters")
export class SemestersController {
  constructor(private readonly semestersService: SemestersService) {}

  @Post()
  create(@Body() dto: CreateSemesterDto) {
    return this.semestersService.create(dto);
  }

  @Get()
  list(@Query() query: PaginationDto) {
    return this.semestersService.list(query);
  }

  @Get(":id")
  get(@Param() params: IdParamDto) {
    return this.semestersService.get(params.id);
  }

  @Patch(":id")
  update(@Param() params: IdParamDto, @Body() dto: UpdateSemesterDto) {
    return this.semestersService.update(params.id, dto);
  }

  @Delete(":id")
  remove(@Param() params: IdParamDto) {
    return this.semestersService.remove(params.id);
  }
}
