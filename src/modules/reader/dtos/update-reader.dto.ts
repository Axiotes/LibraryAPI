import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class UpdateReaderDto {
  @ApiPropertyOptional({ description: "Atualizar nome do leitor" })
  @IsOptional()
  @IsString()
  newName: string;

  @ApiPropertyOptional({ description: "Atualizar email do leitor" })
  @IsOptional()
  @IsEmail()
  newEmail: string;
}
