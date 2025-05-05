import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class BookDto {
  @ApiProperty({ description: "Título do livro" })
  @IsString()
  title: string;

  @ApiProperty({ description: "Autor do livro" })
  @IsString()
  author: string;

  @ApiProperty({ description: "Gênero do livro" })
  @IsString()
  genres: string;

  @ApiProperty({ description: "Sinopse do livro" })
  @IsString()
  synopsis: string;

  @ApiProperty({ description: "Ano de publicação do livro" })
  @Type(() => Date)
  @IsDate()
  yearPublication: Date;

  @ApiProperty({ description: "Quantidade em estoque" })
  @IsNumber()
  stock: number;
}
