import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class FindBookDto {
  @ApiPropertyOptional({ description: 'Número de livros que serão pulados' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  skip: number;

  @ApiPropertyOptional({ description: 'Número de livros que serão retornados' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  limit: number;

  @ApiPropertyOptional({
    description: 'Ordenação dos livros retornados (ASC ou DESC)',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'], {
    message: 'O valor de orderBy deve ser ASC ou DESC',
  })
  orderBy: 'ASC' | 'DESC';

  @ApiPropertyOptional({ description: 'Título dos livros' })
  @IsOptional()
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Autores dos livros' })
  @IsOptional()
  @IsString()
  author: string;

  @ApiPropertyOptional({ description: 'Gênero dos livros' })
  @IsOptional()
  @IsString()
  genres: string;

  @ApiPropertyOptional({ description: 'Data publicação' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  firstDate: Date;

  @ApiPropertyOptional({ description: 'Data publicação' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastDate: Date;
}
