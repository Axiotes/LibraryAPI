import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { BookService } from './book.service';
import { BookDto } from './dtos/book-dto';

@Controller('api/v1/book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  public async create(@Body() body: BookDto) {
    return await this.bookService.create(body);
  }

  @Get(':id')
  public findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.findOne(id);
  }
}
