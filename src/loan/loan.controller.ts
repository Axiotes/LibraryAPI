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
import { LoanService } from './loan.service';
import { LoanDto } from './dtos/loan.dto';
import { Loan } from './loan.entity';
import { Observable } from 'rxjs';
import { FindLoanDto } from './dtos/find-loan.dto';
import { Book } from '../book/book.entity';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/auth/guards/role/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('api/v1/loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cadastra novos empréstimos e retorna empréstimos realizados',
    description:
      'Apenas usuários com token jwt e cargos "admin" ou "employee" podem utilizar este endpoint',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Post('')
  public async create(
    @Body() body: LoanDto,
  ): Promise<Loan[] | Observable<never>> {
    return this.loanService.create(body);
  }

  @ApiOperation({
    summary: 'Buscar e retornar os 5 livros com mais empréstimos',
    description: 'Qualquer usuário pode utlizar este endpoint',
  })
  @Get('top-five-books')
  public async popularBooks() {
    return await this.loanService.topFiveBooks();
  }

  @ApiOperation({
    summary: 'Buscar e retornar livros',
    description: `Qualquer usuário pode utilizar este endpoint. 
    Caso deseje utilizar o query param "skip", é necessário utiliza-lo em conjunto com o "limit". 
    Para os query params de data publicação também é necessário utiliza-los em conjunto, 
    em que será retornado os empréstimos realizado entre a data inicial e a final do tipo de data selecionado 
    (loanDate: Data do empréstimos, limitReturnDate: Data limite para devolução, returnedDate: Data de devolução)`,
  })
  @Get('')
  public async find(@Query() query: FindLoanDto): Promise<Loan[]> {
    return this.loanService.find(query);
  }

  @ApiOperation({
    summary: 'Buscar e retornar livros com base no ID',
    description: 'Qualquer usuário pode utlizar este endpoint',
  })
  @Get(':id')
  public async findOne(@Param('id', ParseIntPipe) id: number): Promise<Loan> {
    return await this.loanService.findOne(id);
  }

  @ApiOperation({
    summary: 'Buscar e retornar disponibilidade do livro',
    description: 'Qualquer usuário pode utlizar este endpoint',
  })
  @Get('book/:bookId')
  public async bookAvailabilty(
    @Param('bookId', ParseIntPipe) bookId: number,
  ): Promise<{ book: Book; available: number }> {
    return this.loanService.bookAvailability(bookId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Devolver livro e concluir empréstimo',
    description:
      'Apenas usuários com token jwt e cargos "admin" ou "employee" podem utilizar este endpoint',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Patch(':id')
  public async returnBook(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Loan> {
    return await this.loanService.returnBook(id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deletar cadastro de um empréstimo',
    description:
      'Apenas usuários com token jwt e cargos "admin" podem utilizar este endpoint',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Delete(':id')
  public async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.loanService.delete(id);
  }
}
