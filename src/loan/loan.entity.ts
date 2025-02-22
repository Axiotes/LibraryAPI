import { Book } from 'src/book/book.entity';
import { Reader } from 'src/reader/reader.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Loan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  loanDate: Date;

  @Column()
  limitReturnDate: Date;

  @Column({ nullable: true })
  returnedDate: Date;

  @Column()
  returned: boolean;

  @ManyToOne(() => Reader, (reader) => reader.id, { onDelete: 'CASCADE' })
  reader: Reader;

  @ManyToOne(() => Book, (book) => book.id, { onDelete: 'CASCADE' })
  book: Book;
}
