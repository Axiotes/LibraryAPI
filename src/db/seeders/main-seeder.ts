import { DataSource } from 'typeorm';
import { runSeeder, Seeder, SeederFactoryManager } from 'typeorm-extension';
import ReadersSeeder from './readers.seed';
import BooksSeeder from './books.seed';
import LoansSeerder from './loans.seeder';
import FakeAuthSeeders from './fake-auth.seeder';
import AdminAuthSeeders from './admin-auth.seeder';

export class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    await runSeeder(dataSource, AdminAuthSeeders);

    if (process.env.FAKE_DATA) {
      await runSeeder(dataSource, ReadersSeeder);
      await runSeeder(dataSource, BooksSeeder);
      await runSeeder(dataSource, LoansSeerder);
      await runSeeder(dataSource, FakeAuthSeeders);
    }
  }
}
