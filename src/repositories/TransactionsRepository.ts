import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';
import GetBalanceService from '../services/GetBalance.service';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  private balance: Balance;

  public async getBalance(): Promise<Balance> {
    const getBalanceService = new GetBalanceService();

    this.balance = await getBalanceService.execute();

    return this.balance;
  }
}

export default TransactionsRepository;
