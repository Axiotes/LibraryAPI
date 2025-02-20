import { Loan } from 'src/loan/loan.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  @OneToMany(() => Loan, (loan) => loan.id)
  loan: Loan;
}
