import { Test, TestingModule } from '@nestjs/testing';
import { ReaderController } from './reader.controller';
import { ReaderService } from './reader.service';
import { Reader } from './reader.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindReadersDto } from './dtos/find-readers.dto';
import { UpdateReaderDto } from './dtos/update-reader.dto';

describe('ReaderController', () => {
  let controller: ReaderController;
  let service: ReaderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReaderController],
      providers: [
        ReaderService,
        {
          provide: getRepositoryToken(Reader),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            preload: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReaderController>(ReaderController);
    service = module.get<ReaderService>(ReaderService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a reader', async () => {
    const readerDto = {
      name: 'Reader Name',
      email: 'reader@example.com',
      cpf: '12345678901',
    };
    const reader = new Reader();
    reader.name = readerDto.name;
    reader.email = readerDto.email;
    reader.cpf = readerDto.cpf;

    service.create = jest.fn().mockResolvedValue(reader);

    const result = await controller.create(readerDto);

    expect(service.create).toHaveBeenCalledWith(readerDto);
    expect(result).toEqual(reader);
  });

  it('should find all readers', async () => {
    const query: FindReadersDto = { skip: 0, limit: 10, orderBy: 'ASC' };
    const readers = [new Reader(), new Reader()];

    service.findAll = jest.fn().mockResolvedValue(readers);

    const result = await controller.findAll(query);

    expect(service.findAll).toHaveBeenCalledWith(query);
    expect(result).toEqual(readers);
  });

  it('should find a reader by id', async () => {
    const id = 1;
    const reader = new Reader();
    reader.id = id;

    service.findBy = jest.fn().mockResolvedValue(reader);

    const result = await controller.findById(id);

    expect(service.findBy).toHaveBeenCalledWith('id', reader.id);
    expect(result).toEqual(reader);
  });

  it('should find a reader by cpf', async () => {
    const cpf = '12345678901';
    const reader = new Reader();
    reader.cpf = cpf;

    service.findBy = jest.fn().mockResolvedValue(reader);

    const result = await controller.findByCPF(cpf);

    expect(service.findBy).toHaveBeenCalledWith('cpf', reader.cpf);
    expect(result).toEqual(reader);
  });

  it("should update reader's email", async () => {
    const id = 1;
    const readerDto: UpdateReaderDto = {
      newName: undefined,
      newEmail: 'newemail@example.com',
    };

    const reader = new Reader();
    reader.id = id;
    reader.email = 'oldemail@example.com';
    reader.name = 'Reader Name';

    const updatedReader = new Reader();
    updatedReader.id = id;
    updatedReader.email = readerDto.newEmail;
    updatedReader.name = reader.name;

    service.update = jest.fn().mockResolvedValue(updatedReader);

    const result = await controller.update(id, readerDto);

    expect(service.update).toHaveBeenCalledWith(id, readerDto);
    expect(result).toEqual(updatedReader);
  });

  it("should update reader's name", async () => {
    const id = 1;
    const readerDto: UpdateReaderDto = {
      newName: 'New Reader Name',
      newEmail: undefined,
    };

    const reader = new Reader();
    reader.id = id;
    reader.email = 'reader@example.com';
    reader.name = 'Old Reader Name';

    const updatedReader = new Reader();
    updatedReader.id = id;
    updatedReader.email = reader.email;
    updatedReader.name = readerDto.newName;

    service.update = jest.fn().mockResolvedValue(updatedReader);

    const result = await controller.update(id, readerDto);

    expect(service.update).toHaveBeenCalledWith(id, readerDto);
    expect(result).toEqual(updatedReader);
  });

  it("should update reader's email and name", async () => {
    const id = 1;
    const readerDto: UpdateReaderDto = {
      newName: 'New Reader Name',
      newEmail: 'newemail@example.com',
    };

    const reader = new Reader();
    reader.id = id;
    reader.email = 'oldreader@example.com';
    reader.name = 'Old Reader Name';

    const updatedReader = new Reader();
    updatedReader.id = id;
    updatedReader.email = readerDto.newEmail;
    updatedReader.name = readerDto.newName;

    service.update = jest.fn().mockResolvedValue(updatedReader);

    const result = await controller.update(id, readerDto);

    expect(service.update).toHaveBeenCalledWith(id, readerDto);
    expect(result).toEqual(updatedReader);
  });

  it('should delete a reader', async () => {
    const id = 1;

    service.delete = jest
      .fn()
      .mockResolvedValue({ message: 'Leitor deletado' });

    const result = await controller.delete(id);

    expect(service.delete).toHaveBeenCalledWith(id);
    expect(result).toEqual({ message: 'Leitor deletado' });
  });
});
