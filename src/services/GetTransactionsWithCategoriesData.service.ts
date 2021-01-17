import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

class GetTransactionsWithCategoriesDataService {
  public async execute(): Promise<Transaction[]> {
    const transactionsRepository = getRepository(Transaction);
    const transactions = await transactionsRepository.find();

    const transactionsWithCategoryPromise = transactions.map(async transaction => {
      const categoriesRepository = getRepository(Category);
      const category = await categoriesRepository.findOne({
        where: { id: transaction.category_id },
      });

      if (!category) throw new AppError('Category is not found!');

      const tmp = {
        ...transaction,
        category,
      };

      return tmp as Transaction;
    });

    const transactionsWithCategory = await Promise.all(transactionsWithCategoryPromise);

    return transactionsWithCategory;
  }
}

export default GetTransactionsWithCategoriesDataService;
