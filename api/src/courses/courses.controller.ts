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
import { CourseFilterDto } from "../common/dto/course-filter.dto";
import { CreateCourseDto, UpdateCourseDto } from "../common/dto/course.dto";
import { IdParamDto } from "../common/dto/id-param.dto";
import { CoursesService } from "./courses.service";

@Controller("courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @Get()
  list(@Query() query: CourseFilterDto) {
    return this.coursesService.list(query);
  }

  @Get(":id")
  get(@Param() params: IdParamDto) {
    return this.coursesService.get(params.id);
  }

  @Patch(":id")
  update(@Param() params: IdParamDto, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(params.id, dto);
  }

  @Delete(":id")
  remove(@Param() params: IdParamDto) {
    return this.coursesService.remove(params.id);
  }
}
