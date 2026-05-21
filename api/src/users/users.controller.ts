import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUserDto, UpdateUserRoleDto } from "../common/dto/user.dto";
import { IdParamDto } from "../common/dto/id-param.dto";
import { UserListDto } from "../common/dto/user-list.dto";
import { UsersService } from "./users.service";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("users")
@ApiCookieAuth()
@Controller("users")
@Roles("ADMIN")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Create a user (admin only)" })
  @ApiResponse({ status: 201, description: "User created" })
  @ApiResponse({ status: 409, description: "Email already exists" })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "List users with optional role and search filters" })
  @ApiResponse({ status: 200, description: "Paginated user list" })
  list(@Query() query: UserListDto) {
    return this.usersService.list(query);
  }

  @Patch(":id/role")
  @ApiOperation({ summary: "Update a user's role" })
  @ApiResponse({ status: 200, description: "Role updated" })
  @ApiResponse({ status: 404, description: "User not found" })
  updateRole(@Param() params: IdParamDto, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateRole(params.id, dto);
  }
}
