import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReaderModule } from '../reader/reader.module';
import { BookModule } from '../book/book.module';

import { Loan } from './loan.entity';
import { LoanController } from './loan.controller';
import { LoanService } from './loan.service';

@Module({
  imports: [TypeOrmModule.forFeature([Loan]), ReaderModule, BookModule],
  controllers: [LoanController],
  providers: [LoanService],
})
export class LoanModule {}
