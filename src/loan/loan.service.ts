import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Loan } from './loan.entity';
import { Repository } from 'typeorm';
import { ReaderService } from 'src/reader/reader.service';
import { BookService } from 'src/book/book.service';
import { LoanDto } from './dtos/loan.dto';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan) private readonly loanRepository: Repository<Loan>,
    private readonly readerService: ReaderService,
    private readonly bookService: BookService,
  ) {}

  public async create(loanDto: LoanDto) {
    if (loanDto.bookIds.length > 3) {
      throw new BadRequestException(
        'Cada leitor pode realizar no máximo 3 empréstimos simultâneos',
      );
    }

    const reader = await this.readerService.findBy<'cpf'>(
      'cpf',
      loanDto.readerCpf,
    );

    const loanDate = new Date();
    const limitReturnDate = new Date(
      loanDate.getFullYear(),
      loanDate.getMonth(),
      loanDate.getDate() + 15,
    );

    const queryRunner =
      this.loanRepository.manager.connection.createQueryRunner();

    await queryRunner.startTransaction();
    let newLoans: Loan[] = [];

    try {
      for (let i = 0; i <= loanDto.bookIds.length; i++) {
        const id = loanDto.bookIds[i];
        const book = await this.bookService.findOne(id);

        const loan = await this.loanRepository.create({
          loanDate,
          limitReturnDate,
          returned: false,
          returnedDate: null,
          reader,
          book,
        });
        newLoans.push(await this.loanRepository.save(loan));
      }

      await queryRunner.commitTransaction();
      return newLoans;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Falha ao cadastrar o empréstimo. Tente novamente!',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
