import { IsEmail, IsString, Length } from 'class-validator';

export class ReaderDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(11, 11)
  cpf: string;
}
