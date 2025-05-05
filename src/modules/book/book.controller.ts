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
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { UpdateBookDto } from './dtos/update-book.dto';
import { FindBookDto } from './dtos/find-book.dto';
import { Book } from './book.entity';
import { BookDto } from './dtos/book-dto';
import { BookService } from './book.service';

import { ApiResponse } from '@lib-common/types/api-respose.type';
import { SkipValidated } from '@lib-common/decorators/skip-entity.decorator';
import { ValidatePaginationInterceptor } from '@lib-common/interceptors/validate-pagination/validate-pagination.interceptor';
import { RoleGuard } from '@lib-common/guards/role/role.guard';
import { Roles } from '@lib-common/decorators/roles.decorator';

@SkipValidated(Book)
@UseInterceptors(ValidatePaginationInterceptor)
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cadastra um novo livro e retorna livro criado',
    description:
      'Apenas usuários com token jwt e cargos "admin" ou "employee" podem utilizar este endpoint',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Post()
  public async create(@Body() body: BookDto): Promise<ApiResponse<Book>> {
    const book = await this.bookService.create(body);

    return {
      data: book,
    };
  }

  @ApiOperation({
    summary: 'Busca e retorna livro com base no ID',
    description: 'Qualquer usuário pode utilizar este endpoint',
  })
  @Get(':id')
  public async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Book>> {
    const book = await this.bookService.findOne(id);

    return {
      data: book,
    };
  }

  @ApiOperation({
    summary: 'Busca e retorna livros',
    description: `Qualquer usuário pode utilizar este endpoint. 
    Caso deseje utilizar o query param "skip", é necessário utiliza-lo em conjunto com o "limit". 
    Para os query params de data publicação também é necessário utiliza-los em conjunto`,
  })
  @Get()
  public async find(@Query() query: FindBookDto): Promise<ApiResponse<Book[]>> {
    const books = await this.bookService.find(query);

    return {
      data: books,
      pagination: {
        skip: query.skip,
        limit: query.limit,
      },
      total: books.length,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualiza os dados do livro e retorna dados atualizados',
    description:
      'Apenas usuários com token jwt e cargos "admin" ou "employee" podem utilizar este endpoint',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Patch(':id')
  public async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateBookDto,
  ): Promise<ApiResponse<Book>> {
    const book = await this.bookService.update(id, body);

    return {
      data: book,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deleta cadastro do livro',
    description:
      'Apenas usuários com token jwt e cargo "admin" podem utilizar este endpoint',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Delete(':id')
  public async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<string>> {
    const deleted = await this.bookService.delete(id);

    return {
      data: deleted.message,
    };
  }
}
