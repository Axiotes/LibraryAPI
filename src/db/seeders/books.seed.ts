import { faker } from '@faker-js/faker';
import { Book } from '../../book/book.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class BooksSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(Book);

    for (let i = 0; i <= 80; i++) {
      const book = await repository.create({
        title: faker.word.words(3),
        author: faker.person.fullName(),
        genres: faker.helpers.arrayElement([
          'Fiction',
          'Sci-Fi',
          'Fantasy',
          'Horror',
          'Non-fiction',
          'Mystery',
          'Romance',
          'Adventure',
          'Suspense',
          'Action',
        ]),
        synopsis: faker.lorem.paragraphs(2),
        yearPublication: faker.date.past({ years: 50 }),
        stock: faker.number.int({ min: 0, max: 30 }),
      });
      await repository.save(book);
    }
  }
}
