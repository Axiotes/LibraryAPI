import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsNumber, IsString } from 'class-validator';

export class LoanDto {
  @ApiProperty({ description: 'CPF do leitor' })
  @IsString()
  readerCpf: string;

  @ApiProperty({ description: 'Array de IDs de livros' })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  bookIds: number[];
}
