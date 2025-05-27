import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  Connection,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { ReaderService } from '../reader/reader.service';
import { BookService } from '../book/book.service';
import { Reader } from '../reader/reader.entity';
import { Book } from '../book/book.entity';

import { Loan } from './loan.entity';
import { LoanService } from './loan.service';
import { LoanDto } from './dtos/loan.dto';
import { FindLoanDto } from './dtos/find-loan.dto';

describe('LoanService', () => {
  let service: LoanService;
  let loanRepository: jest.Mocked<Repository<Loan>>;
  let readerService: Partial<jest.Mocked<ReaderService>>;
  let bookService: Partial<BookService>;
  let queryRunner: jest.Mocked<QueryRunner>;
  let connection: jest.Mocked<Connection>;
  let queryBuilder: jest.Mocked<SelectQueryBuilder<Loan>>;

  beforeEach(async () => {
    queryRunner = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        getRepository: jest.fn().mockReturnValue({
          create: jest.fn(),
          save: jest.fn(),
        } as Partial<jest.Mocked<Repository<Loan>>>),
      },
    } as unknown as jest.Mocked<QueryRunner>;

    connection = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    } as unknown as jest.Mocked<Connection>;

    queryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 1 } as Loan]),
      getRawMany: jest.fn(),
    } as unknown as jest.Mocked<SelectQueryBuilder<Loan>>;

    loanRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      preload: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      manager: { connection },
    } as unknown as jest.Mocked<Repository<Loan>>;

    readerService = {
      findBy: jest.fn(),
    } as Partial<jest.Mocked<ReaderService>>;

    bookService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanService,
        { provide: ReaderService, useValue: readerService },
        { provide: BookService, useValue: bookService },
        { provide: getRepositoryToken(Loan), useValue: loanRepository },
      ],
    }).compile();

    service = module.get<LoanService>(LoanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new loan successfully', async () => {
    const loanDto: LoanDto = {
      readerCpf: '12345678901',
      bookIds: [2, 34, 20],
    };
    const reader = new Reader();
    reader.cpf = loanDto.readerCpf;
    reader.name = 'Reader Name';

    readerService.findBy.mockResolvedValue(reader);

    loanRepository.find.mockResolvedValueOnce([]);

    for (const bookId of loanDto.bookIds) {
      jest
        .spyOn(service, 'bookAvailability')
        .mockResolvedValueOnce({ book: { id: bookId } as Book, available: 5 });

      loanRepository.findOne.mockResolvedValueOnce(null);

      const repo = queryRunner.manager.getRepository(Loan) as jest.Mocked<
        Repository<Loan>
      >;
      const loanStub = Object.assign(new Loan(), {
        book: { id: bookId } as Book,
        reader,
        loanDate: expect.any(Date),
        limitReturnDate: expect.any(Date),
        returned: false,
        returnedDate: null,
      });
      repo.create.mockReturnValueOnce(loanStub);
      repo.save.mockResolvedValueOnce(loanStub);
    }

    const result = await service.create(loanDto);

    expect(result).toHaveLength(3);
    result.forEach((loan, idx) => {
      expect(loan.book.id).toBe(loanDto.bookIds[idx]);
      expect(loan.reader).toBe(reader);
      expect(loan.returned).toBe(false);
    });

    expect(queryRunner.startTransaction).toHaveBeenCalled();
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
  });

  it('should throw a BadRequestException if reader have more than 3 loans', async () => {
    const loanDto: LoanDto = {
      readerCpf: '12345678901',
      bookIds: [2, 34, 20],
    };
    const reader = new Reader();
    reader.cpf = loanDto.readerCpf;
    reader.name = 'Reader Name';

    const numLoans = [new Loan()];

    readerService.findBy.mockResolvedValue(reader);
    loanRepository.find.mockResolvedValueOnce(numLoans);

    await expect(service.create(loanDto)).rejects.toThrow(
      new BadRequestException(
        `O leitor ${reader.name} possui ${numLoans.length} empréstimos ativos. Cada leitor pode realizar no máximo 3 empréstimos simultâneos`,
      ),
    );
    expect(queryRunner.startTransaction).toHaveBeenCalledTimes(0);
    expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(0);
    expect(queryRunner.release).toHaveBeenCalledTimes(0);
  });

  it('should throw a BadRequestException if book is out of stock', async () => {
    const loanDto: LoanDto = {
      readerCpf: '12345678901',
      bookIds: [2, 34, 20],
    };
    const reader = new Reader();
    reader.cpf = loanDto.readerCpf;
    reader.name = 'Reader Name';

    readerService.findBy.mockResolvedValue(reader);

    loanRepository.find.mockResolvedValueOnce([]);

    for (const bookId of loanDto.bookIds) {
      jest
        .spyOn(service, 'bookAvailability')
        .mockResolvedValueOnce({ book: { id: bookId } as Book, available: 0 });
    }

    await expect(service.create(loanDto)).rejects.toThrow(
      new BadRequestException(`Este livro está fora de estoque`),
    );
    expect(queryRunner.startTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(0);
    expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('should throw a BadRequestException if reader already has a similar book', async () => {
    const loanDto: LoanDto = {
      readerCpf: '12345678901',
      bookIds: [2, 34, 20],
    };
    const reader = new Reader();
    reader.cpf = loanDto.readerCpf;
    reader.name = 'Reader Name';

    readerService.findBy.mockResolvedValue(reader);

    loanRepository.find.mockResolvedValueOnce([]);

    for (const bookId of loanDto.bookIds) {
      jest
        .spyOn(service, 'bookAvailability')
        .mockResolvedValueOnce({ book: { id: bookId } as Book, available: 5 });

      const loan = new Loan();
      loan.reader = reader;
      loan.book = { id: bookId } as Book;

      loanRepository.findOne.mockResolvedValueOnce(loan);
    }

    await expect(service.create(loanDto)).rejects.toThrow(
      new BadRequestException(
        `Não é permitido ter empréstimos ativos do mesmo livro`,
      ),
    );
    expect(queryRunner.startTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(0);
    expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('should find a loan by id successfuly', async () => {
    const id = 1;
    const loan = new Loan();
    loan.id = id;

    loanRepository.findOne.mockResolvedValueOnce(loan);

    const result = await service.findOne(id);

    expect(result).toEqual(loan);
    expect(loanRepository.findOne).toHaveBeenCalledWith({
      where: { id },
      relations: ['reader', 'book'],
    });
  });

  it('should throw a NotFoundException if loan not found', async () => {
    const id = 1;

    loanRepository.findOne.mockResolvedValueOnce(null);

    await expect(service.findOne(id)).rejects.toThrow(
      new NotFoundException('Empréstimo não encontrado'),
    );
    expect(loanRepository.findOne).toHaveBeenCalledWith({
      where: { id },
      relations: ['reader', 'book'],
    });
  });

  it('should find loans with readerId filter', async () => {
    const params: FindLoanDto = {
      readerId: '42',
      skip: 0,
      limit: 10,
      orderBy: 'ASC',
    } as FindLoanDto;
    const result = await service.find(params);

    expect(loanRepository.createQueryBuilder).toHaveBeenCalledWith('loan');
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'loan.readerId = :readerId',
      {
        readerId: '42',
      },
    );
    expect(queryBuilder.skip).toHaveBeenCalledWith(0);
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('loan.id', 'ASC');
    expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
      'loan.reader',
      'reader',
    );
    expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
      'loan.book',
      'book',
    );
    expect(queryBuilder.getMany).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1 } as Loan]);
  });

  it('should find loans with bookId filter', async () => {
    await service.find({
      bookId: 99,
      returned: false,
      skip: 1,
      limit: 5,
      orderBy: 'DESC',
    } as FindLoanDto);

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'loan.bookId = :bookId',
      {
        bookId: 99,
      },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'loan.returned = :returned',
      {
        returned: 0,
      },
    );
    expect(queryBuilder.skip).toHaveBeenCalledWith(1);
    expect(queryBuilder.take).toHaveBeenCalledWith(5);
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('loan.id', 'DESC');
  });

  it('should find loans with bookLoanDates filter', async () => {
    const params: FindLoanDto = {
      bookLoanDates: 'loanDate',
      firstDate: new Date('2025-01-01'),
      lastDate: new Date('2025-02-01'),
      skip: 2,
      limit: 2,
      orderBy: 'ASC',
    } as FindLoanDto;
    await service.find(params);

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'loan.loanDate BETWEEN :firstDate AND :lastDate',
      { firstDate: params.firstDate, lastDate: params.lastDate },
    );
  });

  it('should return a book successfuly', async () => {
    const loanId = 1;
    const loan = new Loan();
    loan.id = loanId;
    loan.returned = false;

    service.findOne = jest.fn().mockResolvedValueOnce(loan);

    const returnedLoan = {
      ...loan,
      returnedDate: new Date(),
      returned: true,
    };

    loanRepository.preload.mockResolvedValueOnce(returnedLoan);
    loanRepository.save.mockResolvedValueOnce(returnedLoan);

    const result = await service.returnBook(loanId);

    expect(result).toEqual(returnedLoan);
    expect(loanRepository.preload).toHaveBeenCalledWith(returnedLoan);
    expect(loanRepository.save).toHaveBeenCalledWith(returnedLoan);
  });

  it('should throw a ConflictException if book already returned', async () => {
    const loanId = 1;
    const loan = new Loan();
    loan.id = loanId;
    loan.returned = true;

    service.findOne = jest.fn().mockResolvedValueOnce(loan);

    await expect(service.returnBook(loanId)).rejects.toThrow(
      new ConflictException('O livro do empréstimo já foi devolvido'),
    );
    expect(loanRepository.preload).toHaveBeenCalledTimes(0);
    expect(loanRepository.save).toHaveBeenCalledTimes(0);
  });

  it('should return top 5 books with the most loans', async () => {
    const mockLoans: Loan[] = [
      { id: 1, book: { id: 100 } as Book } as Loan,
      { id: 5, book: { id: 101 } as Book } as Loan,
      { id: 3, book: { id: 102 } as Book } as Loan,
      { id: 2, book: { id: 103 } as Book } as Loan,
      { id: 7, book: { id: 104 } as Book } as Loan,
    ];

    queryBuilder.getRawMany.mockResolvedValue(mockLoans);

    const result = await service.topFiveBooks();

    expect(result).toEqual(mockLoans);
    expect(loanRepository.createQueryBuilder).toHaveBeenCalledWith('loan');
    expect(queryBuilder.leftJoin).toHaveBeenCalledWith('loan.book', 'book');
    expect(queryBuilder.select).toHaveBeenCalledWith('book.id', 'bookId');
    expect(queryBuilder.addSelect).toHaveBeenCalledWith(
      'COUNT(loan.id)',
      'totalLoans',
    );
    expect(queryBuilder.groupBy).toHaveBeenCalledWith('book.id');
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('totalLoans', 'DESC');
    expect(queryBuilder.limit).toHaveBeenCalledWith(5);
    expect(queryBuilder.getRawMany).toHaveBeenCalled();
  });

  it('should delete a loan succeffuly', async () => {
    const id = 1;
    const loan = new Loan();
    loan.id = 1;

    service.findOne = jest.fn().mockResolvedValueOnce(loan);

    const result = await service.delete(id);

    expect(result).toEqual({ message: 'Empréstimo deletado' });
  });

  it('should check the availability of a book', async () => {
    const bookId = 1;
    const book = new Book();
    book.id = bookId;
    book.stock = 10;

    bookService.findOne = jest.fn().mockResolvedValueOnce(book);

    const availableLoans = [new Loan(), new Loan(), new Loan()];

    loanRepository.find.mockResolvedValueOnce(availableLoans);

    const result = await service.bookAvailability(bookId);

    expect(result).toEqual({
      book,
      available: book.stock - availableLoans.length,
    });
    expect(loanRepository.find).toHaveBeenCalledWith({
      where: { book, returned: false },
    });
  });

  it('should check pending reader succesfully', async () => {
    const readerId = 1;
    const today = new Date();

    const firstLoan = new Loan();
    firstLoan.limitReturnDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 5,
    );
    firstLoan.fine = 0;
    const secondLoan = new Loan();
    secondLoan.limitReturnDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 5,
    );
    secondLoan.fine = 5;

    const loans: Loan[] = [firstLoan, secondLoan];

    loanRepository.find.mockResolvedValue(loans);
    service['calculateFine'] = jest
      .fn()
      .mockResolvedValueOnce(firstLoan.fine)
      .mockResolvedValueOnce(secondLoan.fine);

    const result = await service.pending(readerId);

    expect(result).toEqual({
      loans,
      totalFines: firstLoan.fine + secondLoan.fine,
    });
  });

  it('should throw a NotFoundException if no loan found', async () => {
    const readerId = 1;

    loanRepository.find.mockResolvedValueOnce([]);

    await expect(service.pending(readerId)).rejects.toThrow(
      new NotFoundException('Nenhum empréstimo pendente encontrado'),
    );
  });
});
