import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class FindReadersDto {
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
}
