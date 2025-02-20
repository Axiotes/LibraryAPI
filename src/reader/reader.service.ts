import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reader } from './reader.entity';
import { Repository } from 'typeorm';
import { ReaderDto } from './dtos/reader.dto';

@Injectable()
export class ReaderService {
  constructor(
    @InjectRepository(Reader)
    private readonly readerRepository: Repository<Reader>,
  ) {}

  public async create(readerDto: ReaderDto): Promise<Reader> {
    const readerEmail = await this.readerRepository.findOne({
      where: { email: readerDto.email },
    });

    if (readerEmail) {
      throw new ConflictException(
        `O e-mail ${readerDto.email} já está cadastrado.`,
      );
    }

    const readerCpf = await this.readerRepository.findOne({
      where: { cpf: readerDto.cpf },
    });

    if (readerCpf) {
      throw new ConflictException(`O CPF ${readerDto.cpf} já está cadastrado.`);
    }

    const reader = await this.readerRepository.create(readerDto);
    return await this.readerRepository.save(reader);
  }
}
