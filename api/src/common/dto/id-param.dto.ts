import { IsString, MinLength } from "class-validator";

export class IdParamDto {
  @IsString()
  @MinLength(1)
  id!: string;
}
