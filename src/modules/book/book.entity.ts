import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Loan } from '../loan/loan.entity';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column()
  genres: string;

  @Column({ type: 'text' })
  synopsis: string;

  @Column()
  yearPublication: Date;

  @Column()
  stock: number;

  @OneToMany(() => Loan, (loan) => loan.id)
  loan: Loan;
}
