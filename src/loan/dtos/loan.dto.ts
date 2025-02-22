import { ArrayNotEmpty, IsArray, IsNumber, IsString } from 'class-validator';

export class LoanDto {
  @IsString()
  readerCpf: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  bookIds: number[];
}
