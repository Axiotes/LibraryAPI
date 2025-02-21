import { Body, Controller, Post } from '@nestjs/common';
import { LoanService } from './loan.service';
import { LoanDto } from './dtos/loan.dto';

@Controller('api/v1/loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post('')
  public async create(@Body() body: LoanDto) {
    return this.loanService.create(body);
  }
}
