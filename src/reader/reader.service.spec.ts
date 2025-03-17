import { Test, TestingModule } from '@nestjs/testing';
import { ReaderService } from './reader.service';
import { Reader } from './reader.entity';
import { Repository } from 'typeorm';
import { ReaderDto } from './dtos/reader.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';

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
    readerRepositoryMock.findOne.mockResolvedValueOnce(null);

    const reader = new Reader();
    reader.name = readerDto.name;
    reader.email = readerDto.email;
    reader.cpf = readerDto.cpf;

    readerRepositoryMock.create.mockReturnValue(reader);
    readerRepositoryMock.save.mockResolvedValueOnce(reader);

    const result = await service.create(readerDto);

    expect(readerRepositoryMock.findOne).toHaveBeenCalledTimes(2);
    expect(readerRepositoryMock.create).toHaveBeenCalledTimes(1);
    expect(readerRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(readerRepositoryMock.create).toHaveBeenCalledWith(readerDto);
    expect(readerRepositoryMock.save).toHaveBeenCalledWith(reader);
    expect(result).toEqual(reader);
  });

  it('should throw an error if the email is already registered', async () => {
    const readerDto: ReaderDto = {
      name: 'Test Reader',
      email: 'test@example.com',
      cpf: '12345678901',
    };

    readerRepositoryMock.findOne.mockResolvedValueOnce({} as Reader);

    await expect(service.create(readerDto)).rejects.toThrow(
      new ConflictException(`O e-mail ${readerDto.email} já está cadastrado.`),
    );
    expect(readerRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    expect(readerRepositoryMock.create).toHaveBeenCalledTimes(0);
    expect(readerRepositoryMock.save).toHaveBeenCalledTimes(0);
  });

  it('should throw an error if the cpf is already registered', async () => {
    const readerDto: ReaderDto = {
      name: 'Test Reader',
      email: 'test@example.com',
      cpf: '12345678901',
    };

    readerRepositoryMock.findOne.mockResolvedValueOnce(null);
    readerRepositoryMock.findOne.mockResolvedValueOnce({} as Reader);

    await expect(service.create(readerDto)).rejects.toThrow(
      new ConflictException(`O CPF ${readerDto.cpf} já está cadastrado.`),
    );
    expect(readerRepositoryMock.findOne).toHaveBeenCalledTimes(2);
    expect(readerRepositoryMock.create).toHaveBeenCalledTimes(0);
    expect(readerRepositoryMock.save).toHaveBeenCalledTimes(0);
  });
});
