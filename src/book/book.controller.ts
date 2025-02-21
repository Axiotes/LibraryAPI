import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { BookService } from './book.service';
import { BookDto } from './dtos/book-dto';
import { Book } from './book.entity';
import { FindBookDto } from './dtos/find-book.dto';

@Controller('api/v1/book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  public async create(@Body() body: BookDto): Promise<Book> {
    return await this.bookService.create(body);
  }

  @Get(':id')
  public async findOne(@Param('id', ParseIntPipe) id: number): Promise<Book> {
    return await this.bookService.findOne(id);
  }

  @Get()
  public async find(@Query() query: FindBookDto) {
    return await this.bookService.find(query);
  }
}
