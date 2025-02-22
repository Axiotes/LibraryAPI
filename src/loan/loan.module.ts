import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from './loan.entity';
import { LoanController } from './loan.controller';
import { LoanService } from './loan.service';
import { ReaderModule } from 'src/reader/reader.module';
import { BookModule } from 'src/book/book.module';

@Module({
  imports: [TypeOrmModule.forFeature([Loan]), ReaderModule, BookModule],
  controllers: [LoanController],
  providers: [LoanService],
})
export class LoanModule {}
