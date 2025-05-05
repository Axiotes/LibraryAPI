import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { Auth } from '@lib-modules/auth/auth.entity';
import { AuthRoleEnum } from '@lib-common/enums/auth-role.enum';

export default class FakeAuthSeeders implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const repository = dataSource.getRepository(Auth);

    for (let i = 0; i <= 5; i++) {
      const authUser = await repository.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: AuthRoleEnum.ADMIN,
      });
      await repository.save(authUser);
    }

    for (let i = 0; i <= 10; i++) {
      const authUser = await repository.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: AuthRoleEnum.EMPLOYEE,
      });
      await repository.save(authUser);
    }
  }
}
