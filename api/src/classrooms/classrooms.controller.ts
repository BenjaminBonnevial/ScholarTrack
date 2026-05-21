import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { Roles } from "../auth/decorators/roles.decorator";
import { AssignStudentsDto, CreateClassroomDto, UpdateClassroomDto } from "../common/dto/classroom.dto";
import { IdParamDto } from "../common/dto/id-param.dto";
import { ClassroomsService } from "./classrooms.service";

@ApiTags("classrooms")
@ApiCookieAuth()
@Roles("ADMIN")
@Controller("classrooms")
export class ClassroomsController {
  constructor(private readonly classroomsService: ClassroomsService) {}

  @Post()
  @ApiOperation({ summary: "Create a classroom" })
  @ApiResponse({ status: 201, description: "Classroom created" })
  create(@Body() dto: CreateClassroomDto) {
    return this.classroomsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "List all classrooms with student and course counts" })
  @ApiResponse({ status: 200, description: "Classroom list" })
  list() {
    return this.classroomsService.list();
  }

  @Get("my")
  @Roles("STUDENT", "ADMIN")
  @ApiOperation({ summary: "Get the current student's classroom and courses (schedule)" })
  @ApiResponse({ status: 200, description: "Student classroom with courses" })
  getMyClassroom(@Req() req: Request) {
    const userId = (req.auth as unknown as { user: { id: string } }).user.id;
    return this.classroomsService.getMyClassroom(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a classroom by id" })
  @ApiResponse({ status: 200, description: "Classroom found" })
  @ApiResponse({ status: 404, description: "Classroom not found" })
  get(@Param() params: IdParamDto) {
    return this.classroomsService.get(params.id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a classroom" })
  @ApiResponse({ status: 200, description: "Classroom updated" })
  @ApiResponse({ status: 404, description: "Classroom not found" })
  update(@Param() params: IdParamDto, @Body() dto: UpdateClassroomDto) {
    return this.classroomsService.update(params.id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a classroom (students are unassigned)" })
  @ApiResponse({ status: 200, description: "Classroom deleted" })
  @ApiResponse({ status: 404, description: "Classroom not found" })
  remove(@Param() params: IdParamDto) {
    return this.classroomsService.remove(params.id);
  }

  @Post(":id/students")
  @ApiOperation({ summary: "Assign students to a classroom" })
  @ApiResponse({ status: 200, description: "Students assigned" })
  @ApiResponse({ status: 400, description: "Non-student users in the list" })
  assignStudents(@Param() params: IdParamDto, @Body() dto: AssignStudentsDto) {
    return this.classroomsService.assignStudents(params.id, dto);
  }

  @Delete(":id/students/:studentId")
  @ApiOperation({ summary: "Remove a student from a classroom" })
  @ApiResponse({ status: 200, description: "Student removed" })
  @ApiResponse({ status: 404, description: "Student not in this classroom" })
  removeStudent(@Param("id") id: string, @Param("studentId") studentId: string) {
    return this.classroomsService.removeStudent(id, studentId);
  }
}
