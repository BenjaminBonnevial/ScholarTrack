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
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { CourseFilterDto } from "../common/dto/course-filter.dto";
import { CreateCourseDto, UpdateCourseDto } from "../common/dto/course.dto";
import { IdParamDto } from "../common/dto/id-param.dto";
import { CoursesService } from "./courses.service";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("courses")
@ApiCookieAuth()
@Controller("courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles("TEACHER", "ADMIN")
  @ApiOperation({ summary: "Create a course" })
  @ApiResponse({ status: 201, description: "Course created" })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  create(@Body() dto: CreateCourseDto, @Req() req: Request) {
    return this.coursesService.create(dto, req.auth!);
  }

  @Get()
  @ApiOperation({ summary: "List courses (teachers see only their own)" })
  @ApiResponse({ status: 200, description: "Paginated course list" })
  list(@Query() query: CourseFilterDto, @Req() req: Request) {
    return this.coursesService.list(query, req.auth!);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a course by id" })
  @ApiResponse({ status: 200, description: "Course found" })
  @ApiResponse({ status: 404, description: "Course not found" })
  get(@Param() params: IdParamDto) {
    return this.coursesService.get(params.id);
  }

  @Patch(":id")
  @Roles("TEACHER", "ADMIN")
  @ApiOperation({ summary: "Update a course" })
  @ApiResponse({ status: 200, description: "Course updated" })
  @ApiResponse({ status: 403, description: "Forbidden — not the course owner" })
  @ApiResponse({ status: 404, description: "Course not found" })
  update(@Param() params: IdParamDto, @Body() dto: UpdateCourseDto, @Req() req: Request) {
    return this.coursesService.update(params.id, dto, req.auth!);
  }

  @Delete(":id")
  @Roles("TEACHER", "ADMIN")
  @ApiOperation({ summary: "Delete a course" })
  @ApiResponse({ status: 200, description: "Course deleted" })
  @ApiResponse({ status: 403, description: "Forbidden — not the course owner" })
  @ApiResponse({ status: 404, description: "Course not found" })
  remove(@Param() params: IdParamDto, @Req() req: Request) {
    return this.coursesService.remove(params.id, req.auth!);
  }
}
