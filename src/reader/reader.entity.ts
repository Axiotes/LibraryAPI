import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Reader {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, length: 11 })
  cpf: string;
}