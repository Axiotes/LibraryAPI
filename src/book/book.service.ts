import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { Repository } from 'typeorm';
import { BookDto } from './dtos/book-dto';

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
}
