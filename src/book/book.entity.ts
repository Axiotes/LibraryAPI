import { Loan } from 'src/loan/loan.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  @OneToMany(() => Loan, (loan) => loan.id)
  loan: Loan;
}
