import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CreateUserDto, UpdateUserRoleDto } from "../common/dto/user.dto";
import { IdParamDto } from "../common/dto/id-param.dto";
import { UserListDto } from "../common/dto/user-list.dto";
import { UsersService } from "./users.service";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("users")
@Roles("ADMIN")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  list(@Query() query: UserListDto) {
    return this.usersService.list(query);
  }

  @Patch(":id/role")
  updateRole(@Param() params: IdParamDto, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateRole(params.id, dto);
  }
}
