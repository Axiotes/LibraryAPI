import { faker } from '@faker-js/faker';
import { Loan } from '../../modules/loan/loan.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Reader } from 'src/modules/reader/reader.entity';
import { Book } from 'src/modules/book/book.entity';

export default class FakeLoansSeerder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const loanRepository = dataSource.getRepository(Loan);
    const readerRepository = dataSource.getRepository(Reader);
    const bookRepository = dataSource.getRepository(Book);

    for (let i = 0; i < 85; i++) {
      const readerId = faker.number.int({ min: 1, max: 30 });
      const reader = await readerRepository.findOne({
        where: { id: readerId },
      });

      const bookId = faker.number.int({ min: 1, max: 65 });
      const book = await bookRepository.findOne({
        where: { id: bookId },
      });

      const bookLoans = await loanRepository.find({
        where: { book: book, returned: false },
      });
      const available = book.stock - bookLoans.length;

      if (available <= 0) {
        i--;
        continue;
      }

      const loanDate = faker.date.recent({ days: 10 });
      const limitReturnDate = new Date(
        loanDate.getFullYear(),
        loanDate.getMonth(),
        loanDate.getDate() + 15,
      );
      const returned =
        faker.number.int({ min: 0, max: 1 }) === 1 ? true : false;
      let returnedDate = null;

      if (returned) {
        returnedDate = faker.date.between({
          from: loanDate,
          to: limitReturnDate,
        });
      }

      const loan = await loanRepository.create({
        loanDate,
        limitReturnDate,
        returnedDate,
        returned,
        reader,
        book,
      });

      await loanRepository.save(loan);
    }
  }
}
