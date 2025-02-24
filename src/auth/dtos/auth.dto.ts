import { IsEmail, IsEnum, IsString } from 'class-validator';
import { AuthRoleEnum } from 'src/enums/auth-role.enum';

export class AuthDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(['employee', 'admin'])
  role: AuthRoleEnum;
}
