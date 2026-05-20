import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import type { Request } from "express";
import { CourseFilterDto } from "../common/dto/course-filter.dto";
import { CreateCourseDto, UpdateCourseDto } from "../common/dto/course.dto";
import { IdParamDto } from "../common/dto/id-param.dto";
import { CoursesService } from "./courses.service";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles("TEACHER", "ADMIN")
  create(@Body() dto: CreateCourseDto, @Req() req: Request) {
    return this.coursesService.create(dto, req.auth!);
  }

  @Get()
  list(@Query() query: CourseFilterDto, @Req() req: Request) {
    return this.coursesService.list(query, req.auth!);
  }

  @Get(":id")
  get(@Param() params: IdParamDto) {
    return this.coursesService.get(params.id);
  }

  @Patch(":id")
  @Roles("TEACHER", "ADMIN")
  update(@Param() params: IdParamDto, @Body() dto: UpdateCourseDto, @Req() req: Request) {
    return this.coursesService.update(params.id, dto, req.auth!);
  }

  @Delete(":id")
  @Roles("TEACHER", "ADMIN")
  remove(@Param() params: IdParamDto, @Req() req: Request) {
    return this.coursesService.remove(params.id, req.auth!);
  }
}
