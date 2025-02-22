import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class FindLoanDto {
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
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  readerId: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  bookId: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  returned: boolean;

  @IsOptional()
  @IsEnum(['loanDate', 'limitReturnDate', 'returnedDate'], {
    message:
      'O valor de orderBy deve ser "loanDate", "limitReturnDate" ou "returnedDate"',
  })
  bookLoanDates: 'loanDate' | 'limitReturnDate' | 'returnedDate';

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  firstDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastDate: Date;
}
