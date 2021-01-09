import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(uuid: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transaction = await transactionsRepository.findOne({ where: { id: uuid } });

    if (!transaction) throw new AppError('Transaction not found!');

    const balance = await transactionsRepository.getBalance();

    if (transaction.type === 'income' && transaction.value > balance.total) {
      throw new AppError('Illegal operation!');
    }

    await transactionsRepository.delete(uuid);
  }
}

export default DeleteTransactionService;
