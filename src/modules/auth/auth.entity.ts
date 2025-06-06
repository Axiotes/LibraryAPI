import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';

import { AuthRoleEnum } from '@lib-common/enums/auth-role.enum';

@Entity()
export class Auth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: AuthRoleEnum })
  role: AuthRoleEnum;

  @BeforeInsert()
  @BeforeUpdate()
  public async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
