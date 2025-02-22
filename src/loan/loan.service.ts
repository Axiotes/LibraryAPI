import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Loan } from './loan.entity';
import { Repository } from 'typeorm';
import { ReaderService } from 'src/reader/reader.service';
import { BookService } from 'src/book/book.service';
import { LoanDto } from './dtos/loan.dto';
import { Observable, throwError } from 'rxjs';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan) private readonly loanRepository: Repository<Loan>,
    private readonly readerService: ReaderService,
    private readonly bookService: BookService,
  ) {}

  public async create(loanDto: LoanDto): Promise<Loan[] | Observable<never>> {
    const reader = await this.readerService.findBy<'cpf'>(
      'cpf',
      loanDto.readerCpf,
    );

    const numLoans = await this.loanRepository.find({
      where: { reader, returned: false },
    });
    const totalLoans = numLoans.length + loanDto.bookIds.length;

    if (totalLoans > 3) {
      throw new BadRequestException(
        `O leitor ${reader.name} possui ${numLoans.length} empréstimos ativos. Cada leitor pode realizar no máximo 3 empréstimos simultâneos`,
      );
    }

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
      for (let i = 0; i < loanDto.bookIds.length; i++) {
        const id = loanDto.bookIds[i];
        const book = await this.bookService.findOne(id);

        const existingLoan = await this.loanRepository.findOne({
          where: { book, reader, returned: false },
        });

        if (existingLoan) {
          throw new BadRequestException(
            `O leitor ${reader.name} já possui um empréstimo ativo com o livro ${book.title}`,
          );
        }

        const loan = await queryRunner.manager.getRepository(Loan).create({
          loanDate,
          limitReturnDate,
          returned: false,
          returnedDate: null,
          reader,
          book,
        });
        newLoans.push(await queryRunner.manager.getRepository(Loan).save(loan));
      }

      await queryRunner.commitTransaction();
      return newLoans;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return throwError(() => err);
    } finally {
      await queryRunner.release();
    }
  }

  public async findOne(id: number): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: ['reader', 'book'],
    });

    if (!loan) {
      throw new NotFoundException('Empréstimo não encontrado');
    }

    return loan;
  }
}
