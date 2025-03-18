import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as dotenv from 'dotenv';
import { ReaderDto } from 'src/reader/dtos/reader.dto';
import { DataSource, QueryRunner } from 'typeorm';

dotenv.config();

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let queryRunner: QueryRunner;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const authResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/sign-in')
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      });

    token = authResponse.body.token;

    const dataSource = moduleFixture.get(DataSource);
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  it('should create a reader successfuly (POST api/v1/reader)', () => {
    const readerDto: ReaderDto = {
      name: 'Reader Name',
      email: 'reader@example.com',
      cpf: '12345678901',
    };

    return request(app.getHttpServer())
      .post('/api/v1/reader')
      .set('Authorization', `Bearer ${token}`)
      .send(readerDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toEqual({ id: res.body.id, ...readerDto });
      });
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  afterAll(async () => {
    await app.close();
  });
});
