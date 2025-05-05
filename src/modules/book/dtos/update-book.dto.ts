import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBookDto {
  @ApiPropertyOptional({ description: 'Novo título do livro' })
  @IsOptional()
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Novo autor do livro' })
  @IsOptional()
  @IsString()
  author: string;

  @ApiPropertyOptional({ description: 'Novo gênero do livro' })
  @IsOptional()
  @IsString()
  genres: string;

  @ApiPropertyOptional({ description: 'Nova sinopse do livro' })
  @IsOptional()
  @IsString()
  synopsis: string;

  @ApiPropertyOptional({ description: 'Novo ano de publicação do livro' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  yearPublication: Date;

  @ApiPropertyOptional({ description: 'Novo estoque do livro' })
  @IsOptional()
  @IsNumber()
  stock: number;
}
