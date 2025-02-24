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
import { Book } from 'src/book/book.entity';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/auth/guards/role/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('api/v1/loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Post('')
  public async create(
    @Body() body: LoanDto,
  ): Promise<Loan[] | Observable<never>> {
    return this.loanService.create(body);
  }

  @Get('top-five-books')
  public async popularBooks() {
    return await this.loanService.topFiveBooks();
  }

  @Get('')
  public async find(@Query() query: FindLoanDto): Promise<Loan[]> {
    return this.loanService.find(query);
  }

  @Get(':id')
  public async findOne(@Param('id', ParseIntPipe) id: number): Promise<Loan> {
    return await this.loanService.findOne(id);
  }

  @Get('book/:bookId')
  public async bookAvailabilty(
    @Param('bookId', ParseIntPipe) bookId: number,
  ): Promise<{ book: Book; available: number }> {
    return this.loanService.bookAvailability(bookId);
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin', 'employee')
  @Patch(':id')
  public async returnBook(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Loan> {
    return await this.loanService.returnBook(id);
  }

  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles('admin')
  @Delete(':id')
  public async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.loanService.delete(id);
  }
}
