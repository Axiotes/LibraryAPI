import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class FindLoanDto {
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
    description: 'Ordenação dos leitores retornados (ASC ou DESC)',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'], {
    message: 'O valor de orderBy deve ser ASC ou DESC',
  })
  orderBy: 'ASC' | 'DESC';

  @ApiPropertyOptional({ description: 'ID do leitor' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  readerId: string;

  @ApiPropertyOptional({ description: 'ID do livro' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  bookId: number;

  @ApiPropertyOptional({ description: 'Livro devolvido' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  returned: boolean;

  @ApiPropertyOptional({
    description: "Tipo de data ('loanDate', 'limitReturnDate', 'returnedDate')",
  })
  @IsOptional()
  @IsEnum(['loanDate', 'limitReturnDate', 'returnedDate'], {
    message:
      'O valor de orderBy deve ser "loanDate", "limitReturnDate" ou "returnedDate"',
  })
  bookLoanDates: 'loanDate' | 'limitReturnDate' | 'returnedDate';

  @ApiPropertyOptional({ description: 'Data inicial' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  firstDate: Date;

  @ApiPropertyOptional({ description: 'Data final' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastDate: Date;
}
