import { Controller } from '@nestjs/common';

@Controller('api/v1/loan')
export class LoanController {
    constructor(private readonly loanService) {}
}
