import { IsEnum, IsOptional, IsString } from "class-validator";
import { Role } from "../enums";
import { PaginationDto } from "./pagination.dto";

export class UserListDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
