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
import { LoanService } from './loan.service';
import { LoanDto } from './dtos/loan.dto';
import { Loan } from './loan.entity';
import { Observable } from 'rxjs';
import { FindLoanDto } from './dtos/find-loan.dto';
import { Book } from '../book/book.entity';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../common/guards/role/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ValidatePaginationInterceptor } from 'src/common/interceptors/validate-pagination/validate-pagination.interceptor';
import { SkipValidated } from 'src/common/decorators/skip-entity.decorator';
import { ApiResponse } from 'src/common/types/api-respose.type';

@SkipValidated(Loan)
@UseInterceptors(ValidatePaginationInterceptor)
@Controller('loan')
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
  public async create(@Body() body: LoanDto): Promise<ApiResponse<Loan[]>> {
    const loans = await this.loanService.create(body);

    return {
      data: loans,
    };
  }

  @ApiOperation({
    summary: 'Buscar e retornar os 5 livros com mais empréstimos',
    description: 'Qualquer usuário pode utlizar este endpoint',
  })
  @Get('top-five-books')
  public async popularBooks(): Promise<ApiResponse<Loan[]>> {
    const topFive = await this.loanService.topFiveBooks();

    return {
      data: topFive,
      total: topFive.length,
    };
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
  public async find(@Query() query: FindLoanDto): Promise<ApiResponse<Loan[]>> {
    const loans = await this.loanService.find(query);

    return {
      data: loans,
      pagination: {
        skip: query.skip,
        limit: query.limit,
      },
      total: loans.length,
    };
  }

  @ApiOperation({
    summary: 'Buscar e retornar livros com base no ID',
    description: 'Qualquer usuário pode utlizar este endpoint',
  })
  @Get(':id')
  public async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<Loan>> {
    const loan = await this.loanService.findOne(id);

    return {
      data: loan,
    };
  }

  @ApiOperation({
    summary: 'Buscar e retornar disponibilidade do livro',
    description: 'Qualquer usuário pode utlizar este endpoint',
  })
  @Get('book/:bookId')
  public async bookAvailabilty(
    @Param('bookId', ParseIntPipe) bookId: number,
  ): Promise<ApiResponse<{ book: Book; available: number }>> {
    const bookStock = await this.loanService.bookAvailability(bookId);

    return {
      data: bookStock,
    };
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
  ): Promise<ApiResponse<Loan>> {
    const loan = await this.loanService.returnBook(id);

    return {
      data: loan,
    };
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
  public async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<string>> {
    const deleted = await this.loanService.delete(id);

    return {
      data: deleted.message,
    };
  }
}
