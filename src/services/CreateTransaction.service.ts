import { getRepository } from 'typeorm';
import { validate } from 'uuid';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: Category;
}

class CreateTransactionService {
  public async execute({ title, value, type, category }: Request): Promise<Transaction> {
    const isCategoryId = validate(category.id);

    if (!isCategoryId) throw new AppError('The category id is required');

    const transactionsRepository = getRepository(Transaction);

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Invalid type');
    }

    const transactionsOfOutcome = await transactionsRepository.find({
      where: { type: 'outcome' },
    });

    const allOutcomes = transactionsOfOutcome.map(transaction => {
      return transaction.value;
    });

    const sumAllOutcome = allOutcomes.reduce((x, v) => x + v, 0);

    if (type === 'outcome' && value > sumAllOutcome) {
      throw new AppError('Limit exceeded!');
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: category.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
