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
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../auth/decorators/roles.decorator";
import { IdParamDto } from "../common/dto/id-param.dto";
import { PaginationDto } from "../common/dto/pagination.dto";
import { CreateSemesterDto, UpdateSemesterDto } from "../common/dto/semester.dto";
import { SemestersService } from "./semesters.service";

@ApiTags("semesters")
@ApiCookieAuth()
@Roles("ADMIN")
@Controller("semesters")
export class SemestersController {
  constructor(private readonly semestersService: SemestersService) {}

  @Post()
  @ApiOperation({ summary: "Create a semester" })
  @ApiResponse({ status: 201, description: "Semester created" })
  @ApiResponse({ status: 400, description: "Validation error" })
  create(@Body() dto: CreateSemesterDto) {
    return this.semestersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "List semesters" })
  @ApiResponse({ status: 200, description: "Paginated semester list" })
  list(@Query() query: PaginationDto) {
    return this.semestersService.list(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a semester by id" })
  @ApiResponse({ status: 200, description: "Semester found" })
  @ApiResponse({ status: 404, description: "Semester not found" })
  get(@Param() params: IdParamDto) {
    return this.semestersService.get(params.id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a semester" })
  @ApiResponse({ status: 200, description: "Semester updated" })
  @ApiResponse({ status: 404, description: "Semester not found" })
  update(@Param() params: IdParamDto, @Body() dto: UpdateSemesterDto) {
    return this.semestersService.update(params.id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a semester" })
  @ApiResponse({ status: 200, description: "Semester deleted" })
  @ApiResponse({ status: 404, description: "Semester not found" })
  remove(@Param() params: IdParamDto) {
    return this.semestersService.remove(params.id);
  }
}
