import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Book } from './book.entity';
import { BookDto } from './dtos/book-dto';
import { FindBookDto } from './dtos/find-book.dto';
import { UpdateBookDto } from './dtos/update-book.dto';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book) private readonly bookRepository: Repository<Book>,
  ) {}

  public async create(bookDto: BookDto): Promise<Book> {
    const book = await this.bookRepository.create(bookDto);
    return await this.bookRepository.save(book);
  }

  public async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { id } });

    if (!book) {
      throw new NotFoundException('Livro não encontrado');
    }

    return book;
  }

  public async find(queryParams: FindBookDto): Promise<Book[]> {
    if (
      (queryParams.firstDate && !queryParams.lastDate) ||
      (!queryParams.firstDate && queryParams.lastDate)
    ) {
      throw new BadRequestException(
        'Os parâmetros "firstDate" e "lastDate" devem ser usados em conjunto',
      );
    }

    const query = this.bookRepository.createQueryBuilder('book');

    const verifyQueryParams: { [K in keyof FindBookDto]?: () => void } = {
      title: () =>
        query.andWhere('book.title LIKE :title', {
          title: `%${queryParams.title}%`,
        }),
      author: () =>
        query.andWhere('book.author LIKE :author', {
          author: `%${queryParams.author}%`,
        }),
      genres: () =>
        query.andWhere('book.genres LIKE :genres', {
          genres: `%${queryParams.genres}%`,
        }),
      firstDate: () =>
        query.andWhere(
          'book.yearPublication BETWEEN :firstDate AND :lastDate',
          {
            firstDate: queryParams.firstDate,
            lastDate: queryParams.lastDate,
          },
        ),
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
      .orderBy('book.id', queryParams.orderBy);

    return await query.getMany();
  }

  public async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    await this.findOne(id);

    const updatedBook = await this.bookRepository.preload({
      id: id,
      ...updateBookDto,
    });

    return await this.bookRepository.save(updatedBook);
  }

  public async delete(id: number): Promise<{ message: string }> {
    const user = await this.findOne(id);

    await this.bookRepository.delete(user.id);

    return { message: 'Livro deletado' };
  }
}
