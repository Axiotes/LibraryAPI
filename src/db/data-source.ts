import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { MainSeeder } from './seeders/main-seeder';
import { Reader } from '../reader/reader.entity';
import { Loan } from '../loan/loan.entity';
import { Book } from '../book/book.entity';
import { Auth } from '../auth/auth.entity';

const dataSourceOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'db_library',
  entities: [Reader, Loan, Book, Auth],
  synchronize: true,
  logging: true,
  seeds: [MainSeeder],
} as DataSourceOptions & SeederOptions;

export const AppDataSource = new DataSource(dataSourceOptions);
