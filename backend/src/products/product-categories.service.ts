import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@Injectable()
export class ProductCategoriesService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
  ) {}

  create(createDto: CreateProductCategoryDto, tenantId: string): Promise<ProductCategory> {
    const category = this.categoryRepository.create({ ...createDto, tenantId });
    return this.categoryRepository.save(category);
  }

  findAll(tenantId: string): Promise<ProductCategory[]> {
    return this.categoryRepository.find({ where: { tenantId }, order: { name: 'ASC' } });
  }

  async findOne(id: string, tenantId: string): Promise<ProductCategory> {
    const category = await this.categoryRepository.findOneBy({ id, tenantId });
    if (!category) {
      throw new NotFoundException(`La categoría con ID "${id}" no fue encontrada.`);
    }
    return category;
  }

  async update(id: string, updateDto: UpdateProductCategoryDto, tenantId: string): Promise<ProductCategory> {
    // Ensures the category belongs to the tenant before updating
    await this.findOne(id, tenantId);

    const category = await this.categoryRepository.preload({
      id,
      ...updateDto,
    });

    return this.categoryRepository.save(category);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const result = await this.categoryRepository.delete({ id, tenantId });
    if (result.affected === 0) {
      throw new NotFoundException(`La categoría con ID "${id}" no fue encontrada.`);
    }
  }
}