import path from 'path';
import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';
import csvConfig from '../config/import';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from '../services/CreateCategory.service';
import CreateTransactionService from '../services/CreateTransaction.service';
import GetTransactions from '../services/GetTransactionsWithCategoriesData.service';
import DeleteTransactionService from '../services/DeleteTransaction.service';
import ImportTransactionsService from '../services/ImportTransactions.service';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

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

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  return response.status(204).send();
});

transactionsRouter.post('/import', upload.single('file'), async (request, response) => {
  const { filename, mimetype } = request.file;

  const filePath = path.join(uploadConfig.directory, filename);
  const csvData = await csvConfig(filePath);

  const createCategory = new CreateCategoryService();

  const allCategories = csvData.map(csv => {
    const [, , , category] = csv;
    return category;
  });

  const unrepeatedCategories = allCategories.filter((category, index, self) => {
    return index === self.indexOf(category);
  });

  const categoriesPromise = unrepeatedCategories.map(async category => {
    await createCategory.execute(category);
  });

  await Promise.all(categoriesPromise);

  const importTransactions = new ImportTransactionsService();

  const transactions = await importTransactions.execute({
    filePath,
    mimetype,
    csvData,
  });

  return response.json(transactions);
});

export default transactionsRouter;
