import { IsEmail, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateContactDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  username?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  text?: string;
}
