import { faker } from '@faker-js/faker';
import { Reader } from 'src/modules/reader/reader.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class FakeReadersSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(Reader);

    for (let i = 0; i <= 30; i++) {
      const reader = await repository.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        cpf: this.generateCPF(),
      });
      await repository.save(reader);
    }
  }

  public generateCPF(): string {
    let cpf = '';
    const characters = '0123456789';

    for (let i = 0; i < 11; i++) {
      const index = Math.floor(Math.random() * characters.length);
      cpf += characters[index];
    }

    return cpf;
  }
}
