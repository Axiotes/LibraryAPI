import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reflector } from '@nestjs/core';

import { BookController } from './book.controller';
import { BookService } from './book.service';
import { BookDto } from './dtos/book-dto';
import { Book } from './book.entity';
import { FindBookDto } from './dtos/find-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';

import { ValidatePaginationInterceptor } from '@lib-api/common/interceptors/validate-pagination/validate-pagination.interceptor';

describe('BookController', () => {
  let controller: BookController;
  let service: BookService;

  const mockRepo = {
    count: jest.fn().mockResolvedValue(100),
  } as Partial<Repository<Book>>;

  const mockDataSource = {
    getRepository: jest.fn().mockReturnValue(mockRepo),
  } as Partial<DataSource>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [
        BookService,
        {
          provide: getRepositoryToken(Book),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            preload: jest.fn(),
            delete: jest.fn(),
          },
        },
        Reflector,
        ValidatePaginationInterceptor,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    controller = module.get<BookController>(BookController);
    service = module.get<BookService>(BookService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a book successfuly', async () => {
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

    service.create = jest.fn().mockResolvedValueOnce(book);

    const result = await controller.create(bookDto);

    expect(service.create).toHaveBeenCalledWith(bookDto);
    expect(result).toEqual({ data: book });
  });

  it('should find a book by id successfuly', async () => {
    const id = 1;
    const book = new Book();
    book.id = id;

    service.findOne = jest.fn().mockResolvedValueOnce(book);

    const result = await service.findOne(id);

    expect(service.findOne).toHaveBeenCalledWith(id);
    expect(result).toEqual(book);
  });

  it('should find all books', async () => {
    const findBookDto: FindBookDto = {
      title: 'JS',
      author: 'Doe',
      genres: 'Programming',
      firstDate: new Date(2010, 1, 1),
      lastDate: new Date(2020, 1, 1),
      skip: 1,
      limit: 2,
      orderBy: 'ASC',
    };
    const books = [new Book(), new Book()];

    service.find = jest.fn().mockResolvedValueOnce(books);

    const result = await controller.find(findBookDto);

    expect(service.find).toHaveBeenCalledWith(findBookDto);
    expect(result).toEqual({
      data: books,
      pagination: { skip: findBookDto.skip, limit: findBookDto.limit },
      total: books.length,
    });
  });

  it('should update a book and return the updated book', async () => {
    const id = 1;
    const updateData: UpdateBookDto = {
      title: 'New Title',
      author: 'New Author',
      genres: 'Fiction',
      synopsis: 'New Synopsis',
      yearPublication: new Date('2025-01-01'),
      stock: 10,
    };
    const updatedBook = { id, ...updateData };

    service.update = jest.fn().mockResolvedValue(updatedBook);

    const result = await controller.update(id, updateData);

    expect(service.update).toHaveBeenCalledWith(id, updateData);
    expect(result).toEqual({ data: updatedBook });
  });

  it('should delete a book', async () => {
    const id = 1;

    service.delete = jest.fn().mockResolvedValue({ message: 'Livro deletado' });

    const result = await controller.delete(id);

    expect(service.delete).toHaveBeenCalledWith(id);
    expect(result).toEqual({ data: 'Livro deletado' });
  });
});
