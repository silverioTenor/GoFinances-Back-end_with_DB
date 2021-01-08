import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from '../services/CreateCategory.service';
import CreateTransactionService from '../services/CreateTransaction.service';
import GetTransactions from '../services/GetTransactionsWithCategoriesData.service';
// import DeleteTransactionService from '../services/DeleteTransaction.service';
// import ImportTransactionsService from '../services/ImportTransactions.service';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const getTransactionsWithCategories = new GetTransactions();

  const transactions = await getTransactionsWithCategories.execute();
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createCategory = new CreateCategoryService();
  const newCategory = await createCategory.execute(category);

  const createTransaction = new CreateTransactionService();
  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category: newCategory,
  });

  const newTransactionFormatter = {
    id: transaction.id,
    title: transaction.title,
    value: transaction.value,
    type: transaction.type,
    category: newCategory.title,
  };

  return response.json(newTransactionFormatter);
});

// transactionsRouter.delete('/:id', async (request, response) => {
//   // TODO
// });

// transactionsRouter.post('/import', async (request, response) => {
//   // TODO
// });

export default transactionsRouter;
