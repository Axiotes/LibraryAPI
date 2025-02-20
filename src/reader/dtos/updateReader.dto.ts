import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class UpdateReaderDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Length(11, 11)
  cpf: string;
}
