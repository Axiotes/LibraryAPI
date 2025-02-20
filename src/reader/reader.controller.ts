import { Body, Controller, Post } from '@nestjs/common';
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
}
