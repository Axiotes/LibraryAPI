import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reflector } from '@nestjs/core';

import { ReaderService } from '../reader/reader.service';
import { BookService } from '../book/book.service';
import { Reader } from '../reader/reader.entity';
import { Book } from '../book/book.entity';

import { Loan } from './loan.entity';
import { LoanService } from './loan.service';
import { LoanController } from './loan.controller';
import { LoanDto } from './dtos/loan.dto';
import { FindLoanDto } from './dtos/find-loan.dto';

import { ValidatePaginationInterceptor } from '@lib-api/common/interceptors/validate-pagination/validate-pagination.interceptor';

describe('LoanController', () => {
  let controller: LoanController;
  let service: LoanService;

  const mockRepo = {
    count: jest.fn().mockResolvedValue(100),
  } as Partial<Repository<Loan>>;

  const mockDataSource = {
    getRepository: jest.fn().mockReturnValue(mockRepo),
  } as Partial<DataSource>;

  beforeEach(async () => {
    const repositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      preload: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoanController],
      providers: [
        LoanService,
        ReaderService,
        BookService,
        {
          provide: getRepositoryToken(Loan),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(Reader),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(Book),
          useValue: repositoryMock,
        },
        Reflector,
        ValidatePaginationInterceptor,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    controller = module.get<LoanController>(LoanController);
    service = module.get<LoanService>(LoanService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a loan successfuly', async () => {
    const loanDto: LoanDto = {
      readerCpf: '123456789012',
      bookIds: [3, 4, 5],
    };
    const loan = new Loan();

    service.create = jest.fn().mockResolvedValueOnce(loan);

    const result = await controller.create(loanDto);

    expect(result).toEqual({ data: loan });
  });

  it('should return top 5 books with the most loans', async () => {
    const loans = [new Loan(), new Loan(), new Loan(), new Loan(), new Loan()];

    service.topFiveBooks = jest.fn().mockResolvedValueOnce(loans);

    const result = await controller.popularBooks();

    expect(result).toEqual({ data: loans, total: loans.length });
  });

  it('should find loans successfully', async () => {
    const queryParams: FindLoanDto = {
      bookId: 1,
      bookLoanDates: 'loanDate',
      firstDate: new Date(2024, 1, 1),
      lastDate: new Date(2024, 12, 30),
      limit: 10,
      orderBy: 'ASC',
      readerId: '5',
      returned: false,
      skip: 2,
    };
    const loans = [new Loan(), new Loan(), new Loan(), new Loan(), new Loan()];

    service.find = jest.fn().mockResolvedValueOnce(loans);

    const result = await controller.find(queryParams);

    expect(result).toEqual({
      data: loans,
      pagination: {
        skip: queryParams.skip,
        limit: queryParams.limit,
      },
      total: loans.length,
    });
  });

  it('should find a loan by id', async () => {
    const id = 1;
    const loan = new Loan();
    loan.id = id;

    service.findOne = jest.fn().mockResolvedValueOnce(loan);

    const result = await controller.findOne(id);

    expect(result).toEqual({ data: loan });
  });

  it('should check the availability of a book', async () => {
    const bookId = 1;
    const book = new Book();
    book.id = bookId;
    book.stock = 10;

    const availableLoans = [new Loan(), new Loan(), new Loan()];

    const bookAvailable = {
      book,
      available: book.stock - availableLoans.length,
    };

    service.bookAvailability = jest.fn().mockResolvedValueOnce(bookAvailable);

    const result = await controller.bookAvailabilty(bookId);

    expect(result).toEqual({ data: bookAvailable });
  });

  it('should return a book', async () => {
    const loanId = 1;
    const loan = new Loan();
    loan.id = loanId;

    const returnedLoan: Loan = {
      ...loan,
      returned: true,
      returnedDate: new Date(),
    };

    service.returnBook = jest.fn().mockResolvedValueOnce(returnedLoan);

    const result = await controller.returnBook(loanId);

    expect(result).toEqual({ data: returnedLoan });
  });

  it('should delete a loan', async () => {
    const id = 1;

    service.delete = jest
      .fn()
      .mockResolvedValue({ message: 'Empréstimo deletado' });

    const result = await controller.delete(id);

    expect(service.delete).toHaveBeenCalledWith(id);
    expect(result).toEqual({ data: 'Empréstimo deletado' });
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

    service.pending = jest.fn().mockResolvedValueOnce({
      loans,
      totalFines: firstLoan.fine + secondLoan.fine,
    });

    const result = await controller.pending(readerId);

    expect(result).toEqual({
      data: {
        loans,
        totalFines: firstLoan.fine + secondLoan.fine,
      },
    });
  });
});
