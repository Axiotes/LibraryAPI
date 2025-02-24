import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class ReaderDto {
  @ApiProperty({ description: 'Nome do leitor' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email do leitor' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'CPF do leitor, sem "." e "-"' })
  @IsString()
  @Length(11, 11)
  cpf: string;
}
