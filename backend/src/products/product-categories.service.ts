import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductCategoriesService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  create(createDto: CreateProductCategoryDto, tenantId: string): Promise<ProductCategory> {
    const category = this.categoryRepository.create({ ...createDto, tenantId });
    return this.categoryRepository.save(category);
  }

  findAll(tenantId: string, includeDeleted: boolean = false): Promise<ProductCategory[]> {
    const where: FindOptionsWhere<ProductCategory> = { tenantId };
    return this.categoryRepository.find({ where, order: { position: 'ASC' }, withDeleted: includeDeleted });
  }

  async findOne(id: string, tenantId: string): Promise<ProductCategory> {
    // Use findOne to be able to use withDeleted
    const category = await this.categoryRepository.findOne({ where: { id, tenantId }, withDeleted: true });
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
    // Primero, verificamos que la categoría exista (incluso si está borrada) y pertenezca al tenant.
    const category = await this.findOne(id, tenantId);

    // VALIDACIÓN: Contamos cuántos productos usan esta categoría.
    const productCount = await this.productRepository.count({
      where: { category: { id: id } },
    });

    if (productCount > 0) {
      throw new ConflictException(
        `No se puede eliminar la categoría "${category.name}" porque tiene ${productCount} productos asociados.`,
      );
    }

    const result = await this.categoryRepository.softDelete({ id, tenantId });
    if (result.affected === 0) {
      throw new NotFoundException(`La categoría con ID "${id}" no fue encontrada.`);
    }
  }

  async restore(id: string, tenantId: string): Promise<void> {
    const result = await this.categoryRepository.restore({ id, tenantId });
    if (result.affected === 0) {
      throw new NotFoundException(`La categoría con ID "${id}" no fue encontrada.`);
    }
  }

  async reorder(orderedIds: string[], tenantId: string): Promise<void> {
    const queryRunner = this.categoryRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (let i = 0; i < orderedIds.length; i++) {
        await queryRunner.manager.update(ProductCategory, { id: orderedIds[i], tenantId }, { position: i });
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}