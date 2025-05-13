import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, QueryRunner, Repository } from 'typeorm';

import { ReaderService } from '../reader/reader.service';
import { BookService } from '../book/book.service';
import { Reader } from '../reader/reader.entity';
import { Book } from '../book/book.entity';

import { Loan } from './loan.entity';
import { LoanService } from './loan.service';
import { LoanDto } from './dtos/loan.dto';

describe('LoanService', () => {
  let service: LoanService;
  let loanRepository: jest.Mocked<Repository<Loan>>;
  let readerService: Partial<jest.Mocked<ReaderService>>;
  let bookService: Partial<BookService>;
  let queryRunner: jest.Mocked<QueryRunner>;
  let connection: jest.Mocked<Connection>;

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

    loanRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      manager: { connection },
    } as unknown as jest.Mocked<Repository<Loan>>;

    readerService = {
      findBy: jest.fn(),
    } as Partial<jest.Mocked<ReaderService>>;

    bookService = {};

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
});
