import { Test, TestingModule } from '@nestjs/testing';
import { ReaderService } from './reader.service';
import { Reader } from './reader.entity';
import { Repository } from 'typeorm';
import { ReaderDto } from './dtos/reader.dto';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ReaderService', () => {
  let service: ReaderService;
  let readerRepositoryMock: Partial<jest.Mocked<Repository<Reader>>>;

  beforeEach(async () => {
    readerRepositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReaderService,
        { provide: getRepositoryToken(Reader), useValue: readerRepositoryMock },
      ],
    }).compile();

    service = module.get<ReaderService>(ReaderService);
    jest.clearAllMocks();
  });

  it('should create a new user successfuly', async () => {
    const readerDto: ReaderDto = {
      name: 'Test Reader',
      email: 'test@example.com',
      cpf: '12345678901',
    };

    readerRepositoryMock.findOne.mockResolvedValueOnce(null);
    const reader = readerRepositoryMock.create(readerDto);
    readerRepositoryMock.save.mockResolvedValueOnce(reader);

    const result = await service.create(readerDto);

    expect(readerRepositoryMock.findOne).toHaveBeenCalledTimes(2);
    expect(readerRepositoryMock.create).toHaveBeenCalledWith(readerDto);
    expect(readerRepositoryMock.save).toHaveBeenCalledWith(reader);
    expect(result).toEqual(reader);
  });
});
