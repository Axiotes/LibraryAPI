import { DataSource } from 'typeorm';
import { runSeeder, Seeder, SeederFactoryManager } from 'typeorm-extension';
import ReadersSeeder from './readers.seed';
import BooksSeeder from './books.seed';

export class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    // await runSeeder(dataSource, ReadersSeeder);
    await runSeeder(dataSource, BooksSeeder);
  }
}
