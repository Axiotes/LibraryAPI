import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ReaderService } from './reader.service';
import { ReaderDto } from './dtos/reader.dto';
import { Reader } from './reader.entity';
import { UpdateReaderDto } from './dtos/update-reader.dto';
import { FindReadersDto } from './dtos/find-readers.dto';

@Controller('api/v1/reader')
export class ReaderController {
  constructor(private readonly readerService: ReaderService) {}

  @Post()
  public async create(@Body() body: ReaderDto): Promise<Reader> {
    return await this.readerService.create(body);
  }

  @Get()
  public async findAll(@Query() query: FindReadersDto): Promise<Reader[]> {
    return await this.readerService.findAll(query);
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

  @Patch(':id')
  public async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateReaderDto,
  ): Promise<Reader> {
    return await this.readerService.update(id, body);
  }
}
