import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { BookService } from './book.service';
import { Book } from './book.entity';
import { BookDto } from './dtos/book-dto';
import { FindBookDto } from './dtos/find-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';

describe('BookService', () => {
  let service: BookService;
  let bookRepositoryMock: Partial<jest.Mocked<Repository<Book>>>;
  const queryBuilderMock = {
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    bookRepositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      preload: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        { provide: getRepositoryToken(Book), useValue: bookRepositoryMock },
      ],
    }).compile();

    service = module.get<BookService>(BookService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new book successfuly', async () => {
    const bookDto: BookDto = {
      title: 'Unit Tests',
      author: 'Jest',
      genres: 'Education',
      synopsis:
        'This book explores the world of unit testing, offering a practical and theoretical approach for developers',
      yearPublication: new Date(2015, 3, 6),
      stock: 30,
    };

    const book: Book = new Book();
    book.title = bookDto.title;
    book.author = bookDto.author;
    book.genres = bookDto.genres;
    book.synopsis = bookDto.synopsis;
    book.yearPublication = bookDto.yearPublication;
    book.stock = bookDto.stock;

    bookRepositoryMock.create.mockReturnValue(book);
    bookRepositoryMock.save.mockResolvedValueOnce(book);

    const result = await service.create(bookDto);

    expect(bookRepositoryMock.create).toHaveBeenCalledWith(bookDto);
    expect(bookRepositoryMock.save).toHaveBeenCalledWith(book);
    expect(result).toEqual(book);
  });

  it('should find a book by id successfuly', async () => {
    const id = 1;
    const book = new Book();
    book.id = id;

    bookRepositoryMock.findOne.mockResolvedValueOnce(book);

    const result = await service.findOne(id);

    expect(bookRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id } });
    expect(result).toEqual(book);
  });

  it('should throw a NotFoundException if the book is not found by id', async () => {
    const id = 1;

    bookRepositoryMock.findOne.mockResolvedValueOnce(null);

    await expect(service.findOne(id)).rejects.toThrow(
      new NotFoundException('Livro não encontrado'),
    );
    expect(bookRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id } });
  });

  it('should apply title filter', async () => {
    const dto: FindBookDto = {
      title: 'Nest',
      skip: 0,
      limit: 5,
      orderBy: 'DESC',
      author: undefined,
      firstDate: undefined,
      genres: undefined,
      lastDate: undefined,
    };
    queryBuilderMock.getMany.mockResolvedValue([]);

    await service.find(dto);

    expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
      'book.title LIKE :title',
      { title: `%${dto.title}%` },
    );
  });

  it('should apply author filter', async () => {
    const dto: FindBookDto = {
      author: 'Martin',
      skip: 0,
      limit: 5,
      orderBy: 'ASC',
      firstDate: undefined,
      genres: undefined,
      lastDate: undefined,
      title: undefined,
    };
    queryBuilderMock.getMany.mockResolvedValue([]);

    await service.find(dto);

    expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
      'book.author LIKE :author',
      { author: `%${dto.author}%` },
    );
  });

  it('should apply genres filter', async () => {
    const dto: FindBookDto = {
      genres: 'Sci-Fi',
      skip: 2,
      limit: 3,
      orderBy: 'ASC',
      author: undefined,
      firstDate: undefined,
      lastDate: undefined,
      title: undefined,
    };
    queryBuilderMock.getMany.mockResolvedValue([]);

    await service.find(dto);

    expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
      'book.genres LIKE :genres',
      { genres: `%${dto.genres}%` },
    );
  });

  it('should apply date range filter', async () => {
    const dto: FindBookDto = {
      firstDate: new Date(2000, 1, 1),
      lastDate: new Date(2020, 12, 31),
      skip: 0,
      limit: 10,
      orderBy: 'DESC',
      author: undefined,
      genres: undefined,
      title: undefined,
    };
    queryBuilderMock.getMany.mockResolvedValue([]);

    await service.find(dto);

    expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
      'book.yearPublication BETWEEN :firstDate AND :lastDate',
      { firstDate: dto.firstDate, lastDate: dto.lastDate },
    );
  });

  it('should combine multiple filters', async () => {
    const dto: FindBookDto = {
      title: 'JS',
      author: 'Doe',
      genres: 'Programming',
      firstDate: new Date(2010, 1, 1),
      lastDate: new Date(2020, 1, 1),
      skip: 1,
      limit: 2,
      orderBy: 'ASC',
    };
    queryBuilderMock.getMany.mockResolvedValue([]);

    await service.find(dto);

    expect(queryBuilderMock.andWhere).toHaveBeenCalledTimes(4);
    expect(queryBuilderMock.skip).toHaveBeenCalledWith(dto.skip);
    expect(queryBuilderMock.take).toHaveBeenCalledWith(dto.limit);
    expect(queryBuilderMock.orderBy).toHaveBeenCalledWith(
      'book.id',
      dto.orderBy,
    );
  });

  it('should update and return the book when valid data is provided', async () => {
    const id = 1;
    const dto: UpdateBookDto = {
      title: 'New Title',
      author: 'New Author',
      genres: 'Fiction',
      synopsis: 'A great book',
      yearPublication: new Date('2020-01-01'),
      stock: 5,
    };

    const existingBook: Book = {
      id,
      title: 'Old',
      author: 'Old',
      genres: 'Old',
      synopsis: 'Old',
      yearPublication: new Date(),
      stock: 1,
    } as Book;
    const preloadedBook: Book = { ...existingBook, ...dto } as Book;

    jest.spyOn(service, 'findOne').mockResolvedValue(existingBook);
    (bookRepositoryMock.preload as jest.Mock).mockResolvedValue(preloadedBook);
    (bookRepositoryMock.save as jest.Mock).mockResolvedValue(preloadedBook);

    const result = await service.update(id, dto);

    expect(service.findOne).toHaveBeenCalledWith(id);
    expect(bookRepositoryMock.preload).toHaveBeenCalledWith({ id, ...dto });
    expect(bookRepositoryMock.save).toHaveBeenCalledWith(preloadedBook);
    expect(result).toEqual(preloadedBook);
  });

  it('should throw NotFoundException if book does not exist', async () => {
    const id = 2;
    const dto: UpdateBookDto = {} as UpdateBookDto;

    jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

    await expect(service.update(id, dto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(bookRepositoryMock.preload).not.toHaveBeenCalled();
    expect(bookRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('should delete a book', async () => {
    const id = 1;
    const book = new Book();
    book.id = 1;

    service.findOne = jest.fn().mockResolvedValueOnce(id);

    const result = await service.delete(id);

    expect(result).toEqual({ message: 'Livro deletado' });
  });
});
