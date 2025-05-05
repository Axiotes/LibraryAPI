import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({ description: 'Email do usuário autenticado' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Senha do usuário autenticado' })
  @IsString()
  password: string;
}
