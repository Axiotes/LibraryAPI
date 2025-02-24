import { Reader } from '../../reader/reader.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class ReadersSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const repository = dataSource.getRepository(Reader);
    const reader = await repository.create({
      name: 'Arthur',
      email: 'arthur@gmail.com',
      cpf: '71216530440',
    });
    await repository.save(reader);
  }
}
