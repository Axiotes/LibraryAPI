import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEmail()
  newEmail: string;

  @IsOptional()
  @IsString()
  newPassword: string;

  @IsOptional()
  @IsString()
  name: string;
}
