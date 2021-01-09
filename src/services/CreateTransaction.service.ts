import { getCustomRepository } from 'typeorm';
import { validate } from 'uuid';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: Category;
}

class CreateTransactionService {
  private transaction: Transaction;

  public async execute({ title, value, type, category }: Request): Promise<Transaction> {
    const isCategoryId = validate(category.id);

    if (!isCategoryId) throw new AppError('The category id is required');

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Invalid type');
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Limit exceeded!');
    }

    this.transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: category.id,
    });

    await transactionsRepository.save(this.transaction);

    return this.transaction;
  }
}

export default CreateTransactionService;
