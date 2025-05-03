import { faker } from '@faker-js/faker';
import { Book } from '../../modules/book/book.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class FakeBooksSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(Book);

    for (let i = 0; i <= 65; i++) {
      const book = await repository.create({
        title: faker.book.title(),
        author: faker.person.fullName(),
        genres: faker.book.genre(),
        synopsis: faker.lorem.paragraphs(2),
        yearPublication: faker.date.past({ years: 50 }),
        stock: faker.number.int({ min: 0, max: 30 }),
      });
      await repository.save(book);
    }
  }
}
