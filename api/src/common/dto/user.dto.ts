import { Type } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
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
  @IsString()
  @MinLength(1)
  id!: string;
}

export class AuthenticatedUserDto {
  @IsString()
  @MinLength(1)
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
