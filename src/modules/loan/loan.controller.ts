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
import { Throttle } from '@nestjs/throttler';

import { Book } from '../book/book.entity';

import { FindLoanDto } from './dtos/find-loan.dto';
import { Loan } from './loan.entity';
import { LoanDto } from './dtos/loan.dto';
import { LoanService } from './loan.service';

import { ApiResponse } from '@lib-common/types/api-respose.type';
import { SkipValidated } from '@lib-common/decorators/skip-entity.decorator';
import { ValidatePaginationInterceptor } from '@lib-common/interceptors/validate-pagination/validate-pagination.interceptor';
import { Roles } from '@lib-common/decorators/roles.decorator';
import { RoleGuard } from '@lib-common/guards/role/role.guard';

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
  @Throttle({
    default: {
      limit: 15,
      ttl: 60000,
    },
  })
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
  @Throttle({
    default: {
      limit: 60,
      ttl: 60000,
    },
  })
  @Get('top-five-books')
  public async popularBooks(): Promise<ApiResponse<Loan[]>> {
    const topFive = await this.loanService.topFiveBooks();

    return {
      data: topFive,
      total: topFive.length,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar e retornar empréstimos pendentes de um leitor',
    description:
      'Apenas usuários com token jwt e cargos "admin" ou "employee" podem utilizar este endpoint',
  })
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Throttle({
    default: {
      limit: 15,
      ttl: 60000,
    },
  })
  @Get('pending/:readerId')
  public async pending(
    @Param('readerId', ParseIntPipe) id: number,
  ): Promise<ApiResponse<{ loans: Loan[]; totalFines: number }>> {
    const loans = await this.loanService.pending(id);

    return {
      data: loans,
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
  @Throttle({
    default: {
      limit: 60,
      ttl: 60000,
    },
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
  @Throttle({
    default: {
      limit: 60,
      ttl: 60000,
    },
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
  @Throttle({
    default: {
      limit: 100,
      ttl: 60000,
    },
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
  @Throttle({
    default: {
      limit: 15,
      ttl: 60000,
    },
  })
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
  @Throttle({
    default: {
      limit: 5,
      ttl: 60000,
    },
  })
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
