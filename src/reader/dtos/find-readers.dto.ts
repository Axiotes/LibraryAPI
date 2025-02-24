import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class FindReadersDto {
  @ApiPropertyOptional({ description: "Número de leitores que serão pulados" })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  skip: number;

  @ApiPropertyOptional({ description: "Número de leitores que serão retornados" })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit: number;

  @ApiPropertyOptional({ description: "Ordenação dos leitores retornados" })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'], {
    message: 'O valor de orderBy deve ser ASC ou DESC',
  })
  orderBy: 'ASC' | 'DESC';
}
