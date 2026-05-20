import { Injectable } from "@nestjs/common";
import { CreateUserDto, UpdateUserRoleDto } from "../common/dto/user.dto";
import { UserListDto } from "../common/dto/user-list.dto";

@Injectable()
export class UsersService {
  create(dto: CreateUserDto) {
    return { action: "createUser", payload: dto };
  }

  list(query: UserListDto) {
    return { action: "listUsers", query };
  }

  updateRole(id: string, dto: UpdateUserRoleDto) {
    return { action: "updateUserRole", id, payload: dto };
  }
}
