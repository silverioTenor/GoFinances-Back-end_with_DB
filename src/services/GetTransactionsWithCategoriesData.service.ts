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
        id: transaction.id,
        title: transaction.title,
        value: transaction.value,
        type: transaction.type,
        category,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
      };

      return tmp as Transaction;
    });

    const transactionsWithCategory = await Promise.all(transactionsWithCategoryPromise);

    return transactionsWithCategory;
  }
}

export default GetTransactionsWithCategoriesDataService;
