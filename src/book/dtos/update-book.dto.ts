import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  author: string;

  @IsOptional()
  @IsString()
  genres: string;

  @IsOptional()
  @IsString()
  synopsis: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  yearPublication: Date;

  @IsOptional()
  @IsNumber()
  stock: number;
}
