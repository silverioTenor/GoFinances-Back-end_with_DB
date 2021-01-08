import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    async function getValueOfIncomeOrOutcome(
      entity: TransactionsRepository,
      subType: string,
    ): Promise<number> {
      let sumAllTypes = 0;

      const transactionsOfType = await entity.find({
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

    const income = await getValueOfIncomeOrOutcome(this, 'income');
    const outcome = await getValueOfIncomeOrOutcome(this, 'outcome');
    const total = income - outcome;

    const balance: Balance = {
      income,
      outcome,
      total,
    };

    return balance;
  }
}

export default TransactionsRepository;
