import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { BookDto } from './dtos/book-dto';
import { Book } from './book.entity';
import { FindBookDto } from './dtos/find-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/auth/guards/role/role.guard';

@Controller('api/v1/book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
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

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Patch(':id')
  public async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateBookDto,
  ) {
    return await this.bookService.update(id, body);
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Delete(':id')
  public async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.bookService.delete(id);
  }
}
