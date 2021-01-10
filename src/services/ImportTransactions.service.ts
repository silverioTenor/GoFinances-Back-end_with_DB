import fs from 'fs';
import { getRepository } from 'typeorm';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

interface Request {
  filePath: string;
  mimetype: string;
  csvData: any[];
}

class ImportTransactionsService {
  public async execute({ filePath, mimetype, csvData }: Request): Promise<Transaction[]> {
    if (mimetype !== 'text/csv') throw new AppError('Invalid file format.');
    // const newTransactions: Transaction[] = csvData;

    const newTransactionsPromise = csvData.map(
      async (csvLine): Promise<Transaction> => {
        const [title, type, value, category] = csvLine;

        const categoriesRepository = getRepository(Category);
        const foundCategory = await categoriesRepository.findOne({
          where: { title: category },
        });

        if (!foundCategory) throw new AppError('Category not found!');

        const transactionsRepository = getRepository(Transaction);
        const newTransaction = transactionsRepository.create({
          title,
          type,
          value,
          category_id: foundCategory.id,
        });

        await transactionsRepository.save(newTransaction);

        return newTransaction;
      },
    );

    await fs.promises.unlink(filePath);
    const transactions = await Promise.all(newTransactionsPromise);

    return transactions;
  }
}

export default ImportTransactionsService;
