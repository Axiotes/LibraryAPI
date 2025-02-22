import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { LoanService } from './loan.service';
import { LoanDto } from './dtos/loan.dto';
import { Loan } from './loan.entity';
import { Observable } from 'rxjs';

@Controller('api/v1/loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post('')
  public async create(
    @Body() body: LoanDto,
  ): Promise<Loan[] | Observable<never>> {
    return this.loanService.create(body);
  }

  @Get(':id')
  public async findOne(@Param('id', ParseIntPipe) id: number): Promise<Loan> {
    return await this.loanService.findOne(id);
  }
}
