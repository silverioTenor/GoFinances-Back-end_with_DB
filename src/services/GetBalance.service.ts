import { getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

class GetBalance {
  private balance: Balance;

  public async execute(): Promise<Balance> {
    const sumAllTypes = ['income', 'outcome'];

    const transactionsRepository = getRepository(Transaction);

    const valuesTypesPromise = sumAllTypes.map(async type => {
      const transactionsOfType = await transactionsRepository.find({ where: { type } });

      const allValues = transactionsOfType.map(transaction => {
        return transaction.value;
      });

      const tmp = allValues.reduce((x, v) => x + v, 0);

      return tmp;
    });

    const valuesTypes = await Promise.all(valuesTypesPromise);

    const income = valuesTypes[0];
    const outcome = valuesTypes[1];
    const total = income - outcome;

    this.balance = {
      income,
      outcome,
      total,
    };

    return this.balance;
  }
}

export default GetBalance;
