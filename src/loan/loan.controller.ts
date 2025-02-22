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
} from '@nestjs/common';
import { LoanService } from './loan.service';
import { LoanDto } from './dtos/loan.dto';
import { Loan } from './loan.entity';
import { Observable } from 'rxjs';
import { FindLoanDto } from './dtos/find-loan.dto';

@Controller('api/v1/loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

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

  @Patch(':id')
  public async returnBook(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Loan> {
    return await this.loanService.returnBook(id);
  }

  @Delete(':id')
  public async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.loanService.delete(id);
  }
}
