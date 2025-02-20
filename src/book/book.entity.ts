import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
