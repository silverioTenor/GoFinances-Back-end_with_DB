import { getRepository } from 'typeorm';

import Category from '../models/Category';

class CreateCategoryService {
  private category: Category;

  public async execute(title: string): Promise<Category> {
    const categoriesRepository = getRepository(Category);

    const categoryTitleExists = await categoriesRepository.findOne({ where: { title } });

    if (!categoryTitleExists) {
      this.category = categoriesRepository.create({ title });

      await categoriesRepository.save(this.category);

      return this.category;
    }

    this.category = categoryTitleExists;

    return this.category;
  }
}

export default CreateCategoryService;
