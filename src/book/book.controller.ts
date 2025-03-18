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
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../auth/guards/role/role.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('api/v1/book')
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
  public async create(@Body() body: BookDto): Promise<Book> {
    return await this.bookService.create(body);
  }

  @ApiOperation({
    summary: 'Busca e retorna livro com base no ID',
    description: 'Qualquer usuário pode utilizar este endpoint',
  })
  @Get(':id')
  public async findOne(@Param('id', ParseIntPipe) id: number): Promise<Book> {
    return await this.bookService.findOne(id);
  }

  @ApiOperation({
    summary: 'Busca e retorna livros',
    description: `Qualquer usuário pode utilizar este endpoint. 
    Caso deseje utilizar o query param "skip", é necessário utiliza-lo em conjunto com o "limit". 
    Para os query params de data publicação também é necessário utiliza-los em conjunto`,
  })
  @Get()
  public async find(@Query() query: FindBookDto) {
    return await this.bookService.find(query);
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
  ) {
    return await this.bookService.update(id, body);
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
  public async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.bookService.delete(id);
  }
}
