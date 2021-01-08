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

    async function getValueOfIncomeOrOutcome(subType: string): Promise<number> {
      let sumAllTypes = 0;

      const transactionsOfType = await transactionsRepository.find({
        where: { type: subType },
      });

      if (transactionsOfType.length > 0) {
        const allTypes = transactionsOfType.map(transaction => {
          return transaction.value;
        });

        sumAllTypes = allTypes.reduce((x, v) => x + v, 0);
      }

      return sumAllTypes;
    }

    const income = await getValueOfIncomeOrOutcome('income');
    const outcome = await getValueOfIncomeOrOutcome('outcome');
    const total = income - outcome;

    if (type === 'outcome' && value > total) {
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
