import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class BookDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsString()
  genres: string;

  @IsString()
  synopsis: string;

  @Type(() => Date)
  @IsDate()
  yearPublication: Date;

  @IsNumber()
  stock: number;
}
