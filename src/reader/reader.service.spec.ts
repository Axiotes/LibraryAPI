import { Test, TestingModule } from '@nestjs/testing';
import { ReaderService } from './reader.service';
import { Reader } from './reader.entity';
import { Repository } from 'typeorm';
import { ReaderDto } from './dtos/reader.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { FindReadersDto } from './dtos/find-readers.dto';
import { UpdateReaderDto } from './dtos/update-reader.dto';

describe('ReaderService', () => {
  let service: ReaderService;
  let readerRepositoryMock: Partial<jest.Mocked<Repository<Reader>>>;

  beforeEach(async () => {
    readerRepositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      preload: jest.fn(),
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

  it('should find all readers', async () => {
    const findReadersDto: FindReadersDto = {
      skip: 0,
      limit: 10,
      orderBy: 'ASC',
    };

    const readers: Reader[] = [new Reader(), new Reader()];

    const createQueryBuilderMock = {
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(readers),
    };

    readerRepositoryMock.createQueryBuilder = jest
      .fn()
      .mockReturnValue(createQueryBuilderMock);

    const result = await service.findAll(findReadersDto);

    expect(readerRepositoryMock.createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(readerRepositoryMock.createQueryBuilder).toHaveBeenCalledWith(
      'reader',
    );
    expect(createQueryBuilderMock.skip).toHaveBeenCalledWith(
      findReadersDto.skip,
    );
    expect(createQueryBuilderMock.take).toHaveBeenCalledWith(
      findReadersDto.limit,
    );
    expect(createQueryBuilderMock.orderBy).toHaveBeenCalledWith(
      'reader.id',
      findReadersDto.orderBy,
    );
    expect(createQueryBuilderMock.getMany).toHaveBeenCalled();
    expect(result).toEqual(readers);
  });

  it('should throw an error if the limit is not provided when using skip', async () => {
    const findReadersDto: FindReadersDto = {
      skip: 0,
      limit: undefined,
      orderBy: 'ASC',
    };

    readerRepositoryMock.createQueryBuilder = jest.fn();

    await expect(service.findAll(findReadersDto)).rejects.toThrow(
      new BadRequestException(
        'O parâmetro "limit" é obrigatório quando "skip" for utilizado.',
      ),
    );
    expect(readerRepositoryMock.createQueryBuilder).toHaveBeenCalledTimes(0);
  });

  it('should find a reader by id', async () => {
    const reader = new Reader();
    const id = 1;

    readerRepositoryMock.findOne.mockResolvedValueOnce(reader);

    const result = await service.findBy<'id'>('id', id);

    expect(readerRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    expect(readerRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id },
    });
    expect(result).toEqual(reader);
  });

  it('should find a reader by cpf', async () => {
    const reader = new Reader();
    const cpf = '12345678901';

    readerRepositoryMock.findOne.mockResolvedValueOnce(reader);

    const result = await service.findBy<'cpf'>('cpf', cpf);

    expect(readerRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    expect(readerRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { cpf },
    });
    expect(result).toEqual(reader);
  });

  it('should throw an error if the reader is not found by id', async () => {
    const id = 1;

    readerRepositoryMock.findOne.mockResolvedValueOnce(null);

    await expect(service.findBy<'id'>('id', id)).rejects.toThrow(
      new NotFoundException(`Leitor não encontrado`),
    );
    expect(readerRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    expect(readerRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it('should throw an error if the reader is not found by cpf', async () => {
    const cpf = '12345678901';

    readerRepositoryMock.findOne.mockResolvedValueOnce(null);

    await expect(service.findBy<'cpf'>('cpf', cpf)).rejects.toThrow(
      new NotFoundException(`Leitor não encontrado`),
    );
    expect(readerRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    expect(readerRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { cpf },
    });
  });

  it("should update a reader's email", async () => {
    const id = 1;
    const updateReaderDto: UpdateReaderDto = {
      newEmail: 'newemail@example.com',
      newName: undefined,
    };

    const reader = new Reader();
    reader.id = id;
    reader.email = 'oldemail@example.com';
    reader.name = 'Reader Name';

    const readerUpdated = new Reader();
    readerUpdated.id = id;
    readerUpdated.email = updateReaderDto.newEmail;
    readerUpdated.name = reader.name;

    service.findBy = jest.fn().mockResolvedValue(reader);
    readerRepositoryMock.findOne.mockResolvedValueOnce(null);
    readerRepositoryMock.preload.mockResolvedValueOnce(readerUpdated);
    readerRepositoryMock.save.mockResolvedValueOnce(readerUpdated);

    const result = await service.update(id, updateReaderDto);

    expect(service.findBy).toHaveBeenCalledWith('id', id);
    expect(service.findBy).toHaveBeenCalledTimes(1);
    expect(readerRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    expect(readerRepositoryMock.preload).toHaveBeenCalledTimes(1);
    expect(readerRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(result.email).toEqual(readerUpdated.email);
    expect(result.name).toEqual(reader.name);
  });

  it("should update a reader's name", async () => {
    const id = 1;
    const updateReaderDto: UpdateReaderDto = {
      newEmail: undefined,
      newName: 'New Reader Name',
    };

    const reader = new Reader();
    reader.id = id;
    reader.email = 'reader@example.com';
    reader.name = 'Old Reader Name';

    const readerUpdated = new Reader();
    readerUpdated.id = id;
    readerUpdated.email = reader.email;
    readerUpdated.name = updateReaderDto.newName;

    service.findBy = jest.fn().mockResolvedValue(reader);
    readerRepositoryMock.findOne.mockResolvedValueOnce(null);
    readerRepositoryMock.preload.mockResolvedValueOnce(readerUpdated);
    readerRepositoryMock.save.mockResolvedValueOnce(readerUpdated);

    const result = await service.update(id, updateReaderDto);

    expect(service.findBy).toHaveBeenCalledWith('id', id);
    expect(service.findBy).toHaveBeenCalledTimes(1);
    expect(readerRepositoryMock.findOne).toHaveBeenCalledTimes(0);
    expect(readerRepositoryMock.preload).toHaveBeenCalledTimes(1);
    expect(readerRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(result.email).toEqual(reader.email);
    expect(result.name).toEqual(readerUpdated.name);
  });

  it('should update a reader with a new email and name', async () => {
    const id = 1;
    const updateReaderDto: UpdateReaderDto = {
      newEmail: 'oldemail@example.com',
      newName: 'New Reader Name',
    };

    const reader = new Reader();
    reader.id = id;
    reader.email = 'oldemail@example.com';
    reader.name = 'Old Reader Name';

    const readerUpdated = new Reader();
    readerUpdated.id = id;
    readerUpdated.email = updateReaderDto.newEmail;
    readerUpdated.name = updateReaderDto.newName;

    service.findBy = jest.fn().mockResolvedValue(reader);
    readerRepositoryMock.findOne.mockResolvedValueOnce(null);
    readerRepositoryMock.preload.mockResolvedValueOnce(readerUpdated);
    readerRepositoryMock.save.mockResolvedValueOnce(readerUpdated);

    const result = await service.update(id, updateReaderDto);

    expect(service.findBy).toHaveBeenCalledWith('id', id);
    expect(service.findBy).toHaveBeenCalledTimes(1);
    expect(readerRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    expect(readerRepositoryMock.preload).toHaveBeenCalledTimes(1);
    expect(readerRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(result.email).toEqual(readerUpdated.email);
    expect(result.name).toEqual(readerUpdated.name);
  });
});
