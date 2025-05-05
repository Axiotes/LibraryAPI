import { DataSource } from 'typeorm';
import { runSeeder, Seeder, SeederFactoryManager } from 'typeorm-extension';

import FakeReadersSeeder from './fake-readers.seed';
import FakeBooksSeeder from './fake-books.seed';
import FakeLoansSeerder from './fake-loans.seeder';
import FakeAuthSeeders from './fake-auth.seeder';
import AdminAuthSeeders from './admin-auth.seeder';

export class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    await runSeeder(dataSource, AdminAuthSeeders);

    if (process.env.FAKE_DATA) {
      await runSeeder(dataSource, FakeReadersSeeder);
      await runSeeder(dataSource, FakeBooksSeeder);
      await runSeeder(dataSource, FakeLoansSeerder);
      await runSeeder(dataSource, FakeAuthSeeders);
    }
  }
}
