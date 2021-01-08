import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Category from '../models/Category';

class CreateCategoryService {
  public async execute(title: string): Promise<Category> {
    const categoryRepository = getRepository(Category);

    const categoryTitleExists = await categoryRepository.findOne({ where: { title } });

    if (categoryTitleExists) throw new AppError('This title already exists');

    const category = categoryRepository.create({ title });

    await categoryRepository.save(category);

    return category;
  }
}

export default CreateCategoryService;
