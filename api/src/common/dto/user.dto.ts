import { Type } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from "class-validator";
import { Role } from "../enums";

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsEnum(Role)
  role!: Role;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role!: Role;
}

export class UserFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class UserIdDto {
  @IsUUID()
  id!: string;
}

export class AuthenticatedUserDto {
  @IsUUID()
  id!: string;

  @IsEmail()
  email!: string;

  @IsEnum(Role)
  role!: Role;

  @IsOptional()
  @IsString()
  name?: string;
}

export class DateRangeDto {
  @Type(() => Date)
  startDate!: Date;

  @Type(() => Date)
  endDate!: Date;
}
