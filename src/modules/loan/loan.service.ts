import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ReaderService } from '../reader/reader.service';
import { BookService } from '../book/book.service';
import { Book } from '../book/book.entity';

import { Loan } from './loan.entity';
import { LoanDto } from './dtos/loan.dto';
import { FindLoanDto } from './dtos/find-loan.dto';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan) private readonly loanRepository: Repository<Loan>,
    private readonly readerService: ReaderService,
    private readonly bookService: BookService,
  ) {}

  public async create(loanDto: LoanDto): Promise<Loan[]> {
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

    try {
      let lastBookId: number;

      const loansPromisses = loanDto.bookIds.map(async (bookId) => {
        const { book, available } = await this.bookAvailability(bookId);

        if (available === 0) {
          throw new BadRequestException('Este livro está fora de estoque');
        }

        const existingLoan = await this.loanRepository.findOne({
          where: { book, reader, returned: false },
        });

        if (existingLoan || lastBookId === bookId) {
          throw new BadRequestException(
            `Não é permitido ter empréstimos ativos do mesmo livro`,
          );
        }

        lastBookId = bookId;

        const loan = await queryRunner.manager.getRepository(Loan).create({
          loanDate,
          limitReturnDate,
          returned: false,
          returnedDate: null,
          reader,
          book,
        });

        return await queryRunner.manager.getRepository(Loan).save(loan);
      });

      const newLoans: Loan[] = await Promise.all(loansPromisses);

      await queryRunner.commitTransaction();
      return newLoans;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
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

  public async find(queryParams: FindLoanDto): Promise<Loan[]> {
    if (
      queryParams.bookLoanDates &&
      (!queryParams.firstDate || !queryParams.lastDate)
    ) {
      throw new BadRequestException(
        'O parâmetro "bookLoanDates" deve usado em conjunto com os parâmetros "firstDate" e "lastDate"',
      );
    }

    const query = this.loanRepository.createQueryBuilder('loan');

    const verifyQueryParams: { [K in keyof FindLoanDto]?: () => void } = {
      readerId: () => {
        query.andWhere('loan.readerId = :readerId', {
          readerId: queryParams.readerId,
        });
      },
      bookId: () =>
        query.andWhere('loan.bookId = :bookId', { bookId: queryParams.bookId }),
      returned: () =>
        query.andWhere('loan.returned = :returned', {
          returned: queryParams.returned ? 1 : 0,
        }),
      bookLoanDates: () => {
        query.andWhere(
          `loan.${queryParams.bookLoanDates} BETWEEN :firstDate AND :lastDate`,
          {
            firstDate: queryParams.firstDate,
            lastDate: queryParams.lastDate,
          },
        );
      },
    };

    for (const key in queryParams) {
      const func = verifyQueryParams[key];

      if (func) {
        func();
      }
    }

    query
      .skip(queryParams.skip)
      .take(queryParams.limit)
      .orderBy('loan.id', queryParams.orderBy)
      .leftJoinAndSelect('loan.reader', 'reader')
      .leftJoinAndSelect('loan.book', 'book');

    return await query.getMany();
  }

  public async returnBook(loanId: number): Promise<Loan> {
    const loan = await this.findOne(loanId);

    if (loan.returned) {
      throw new ConflictException('O livro do empréstimo já foi devolvido');
    }

    loan.fine = await this.calculateFine(loanId);

    const returnedLoan = await this.loanRepository.preload({
      ...loan,
      returnedDate: new Date(),
      returned: true,
    });

    return await this.loanRepository.save(returnedLoan);
  }

  public async topFiveBooks(): Promise<Loan[]> {
    return await this.loanRepository
      .createQueryBuilder('loan')
      .leftJoin('loan.book', 'book')
      .select('book.id', 'bookId')
      .addSelect('COUNT(loan.id)', 'totalLoans')
      .groupBy('book.id')
      .orderBy('totalLoans', 'DESC')
      .limit(5)
      .getRawMany();
  }

  public async delete(id: number): Promise<{ message: string }> {
    const user = await this.findOne(id);

    await this.loanRepository.delete(user.id);

    return { message: 'Empréstimo deletado' };
  }

  public async bookAvailability(
    bookId: number,
  ): Promise<{ book: Book; available: number }> {
    const book = await this.bookService.findOne(bookId);
    const loans = await this.loanRepository.find({
      where: { book, returned: false },
    });

    return { book: book, available: book.stock - loans.length };
  }

  public async pending(
    readerId: number,
  ): Promise<{ loans: Loan[]; totalFines: number }> {
    const loans = await this.loanRepository.find({
      where: { reader: { id: readerId }, returned: false },
      relations: ['book'],
    });

    if (loans.length === 0) {
      throw new NotFoundException('Nenhum empréstimo pendente encontrado');
    }

    let totalFines = 0;

    const finePromises = loans.map(async (loan) => {
      const fine = await this.calculateFine(loan.id);

      totalFines += fine;

      return { ...loan, fine };
    });
    const loansWithFines = await Promise.all(finePromises);

    return { loans: loansWithFines, totalFines };
  }

  private async calculateFine(id: number): Promise<number> {
    const loan = await this.loanRepository.findOne({ where: { id } });

    if (!loan) {
      throw new NotFoundException('Empréstimo não encontrado');
    }

    if (loan.returned) {
      throw new ConflictException('O livro já foi devolvido');
    }

    const today = new Date();
    const limitReturnDate = new Date(loan.limitReturnDate);

    const timeDiff = today.getTime() - limitReturnDate.getTime();

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    const fine = days > 0 ? days : 0;

    return fine;
  }
}
