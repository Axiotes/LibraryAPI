import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class FindBookDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  skip: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit: number;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], {
    message: 'O valor de orderBy deve ser ASC ou DESC',
  })
  orderBy: 'ASC' | 'DESC';

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
  @Type(() => Date)
  @IsDate()
  firstDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastDate: Date;
}
