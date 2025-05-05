import { Auth } from '@lib-modules/auth/auth.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { AuthRoleEnum } from '@lib-common/enums/auth-role.enum';
import 'dotenv/config';
import * as dotenv from 'dotenv';

dotenv.config();

export default class AdminAuthSeeders implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(Auth);

    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    const admin = await repository.findOne({ where: { name, email } });
    if (admin) {
      console.log('Usuário admin já existente');
      return;
    }

    const adminUser = await repository.create({
      name,
      email,
      password,
      role: AuthRoleEnum.ADMIN,
    });
    await repository.save(adminUser);
    console.log('Usuário admin criado!');
  }
}
