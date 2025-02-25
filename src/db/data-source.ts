import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { MainSeeder } from './seeders/main-seeder';
import { Reader } from '../reader/reader.entity';
import { Loan } from '../loan/loan.entity';
import { Book } from '../book/book.entity';
import { Auth } from '../auth/auth.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSourceOptions = {
  type: 'mysql',
  host: 'localhost',
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [Reader, Loan, Book, Auth],
  synchronize: true,
  logging: true,
  seeds: [MainSeeder],
} as DataSourceOptions & SeederOptions;

export const AppDataSource = new DataSource(dataSourceOptions);
