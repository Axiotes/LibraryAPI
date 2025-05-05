import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateAuthDto {
  @ApiProperty({ description: 'Email do usuário autenticado' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Senha do usuário autenticado' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ description: 'Novo email do usuário autenticado' })
  @IsOptional()
  @IsEmail()
  newEmail: string;

  @ApiPropertyOptional({ description: 'Nova senha do usuário autenticado' })
  @IsOptional()
  @IsString()
  newPassword: string;

  @ApiPropertyOptional({ description: 'Novo nome do usuário autenticado' })
  @IsOptional()
  @IsString()
  name: string;
}
