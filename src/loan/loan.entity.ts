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
  returnDate: Date;

  @Column()
  returned: boolean;

  @ManyToOne(() => Reader, (reader) => reader.id)
  reader: Reader;

  @ManyToOne(() => Book, (book) => book.id)
  book: Book;
}
