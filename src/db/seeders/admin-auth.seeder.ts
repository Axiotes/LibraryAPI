import 'dotenv/config';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { Auth } from '@lib-modules/auth/auth.entity';
import { AuthRoleEnum } from '@lib-common/enums/auth-role.enum';

dotenv.config();

export default class AdminAuthSeeders implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
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
