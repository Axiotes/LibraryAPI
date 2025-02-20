import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ReaderService } from './reader.service';
import { ReaderDto } from './dtos/reader.dto';
import { Reader } from './reader.entity';

@Controller('api/v1/reader')
export class ReaderController {
  constructor(private readonly readerService: ReaderService) {}

  @Post()
  public async create(@Body() body: ReaderDto): Promise<Reader> {
    return await this.readerService.create(body);
  }

  @Get()
  public async findAll(): Promise<Reader[]> {
    return await this.readerService.findAll();
  }

  @Get('id/:id')
  public async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Reader> {
    return this.readerService.findBy<'id'>('id', id);
  }

  @Get('cpf/:cpf')
  public async findByCPF(@Param('cpf') cpf: string): Promise<Reader> {
    return this.readerService.findBy<'cpf'>('cpf', cpf);
  }
}
