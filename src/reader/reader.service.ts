import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reader } from './reader.entity';
import { Repository } from 'typeorm';
import { ReaderDto } from './dtos/reader.dto';
import { UpdateReaderDto } from './dtos/updateReader.dto';

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

  public async findAll(): Promise<Reader[]> {
    return await this.readerRepository.find();
  }

  public async findBy<K extends keyof Reader>(
    key: K,
    value: Reader[K],
  ): Promise<Reader> {
    const reader = await this.readerRepository.findOne({
      where: { [key]: value },
    });

    if (!reader) {
      throw new NotFoundException(`Leitor não encontrado`);
    }

    return reader;
  }

  public async update(
    id: number,
    updateReaderDto: UpdateReaderDto,
  ): Promise<Reader> {
    await this.findBy<'id'>('id', id);

    if (
      updateReaderDto.email &&
      (await this.readerRepository.findOne({
        where: { email: updateReaderDto.email },
      }))
    ) {
      throw new ConflictException(
        `O e-mail ${updateReaderDto.email} já está cadastrado.`,
      );
    }

    if (
      updateReaderDto.cpf &&
      (await this.readerRepository.findOne({
        where: { cpf: updateReaderDto.cpf },
      }))
    ) {
      throw new ConflictException(
        `O CPF ${updateReaderDto.cpf} já está cadastrado.`,
      );
    }

    const updatedReader = await this.readerRepository.preload({
      id: id,
      ...updateReaderDto,
    });

    return await this.readerRepository.save(updatedReader);
  }
}
