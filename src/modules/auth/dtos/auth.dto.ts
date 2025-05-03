import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';
import { AuthRoleEnum } from 'src/common/enums/auth-role.enum';

export class AuthDto {
  @ApiProperty({ description: "Nome do novo usuário autenticado" })  
  @IsString()
  name: string;

  @ApiProperty({ description: "Email do novo usuário autenticado" })  
  @IsEmail()
  email: string;

  @ApiProperty({ description: "Senha do novo usuário autenticado" })  
  @IsString()
  password: string;

  @ApiProperty({ description: "Cargo do novo usuário autenticado" })  
  @IsEnum(['employee', 'admin'])
  role: AuthRoleEnum;
}
