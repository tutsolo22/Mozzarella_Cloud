import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesService } from '../files/files.service';
import 'multer';
import { RecipeItem } from './entities/recipe-item.entity';
import { AssignIngredientsDto } from './dto/assign-ingredients.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(RecipeItem)
    private readonly recipeItemRepository: Repository<RecipeItem>,
    private readonly dataSource: DataSource,
    private readonly filesService: FilesService,
  ) {}

  async create(createProductDto: CreateProductDto, tenantId: string): Promise<Product> {
    const product = this.productRepository.create({
      ...createProductDto,
      tenantId,
    });
    return this.productRepository.save(product);
  }

  findAll(tenantId: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { tenantId },
      relations: ['category'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, tenantId },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Producto con ID "${id}" no encontrado.`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, tenantId: string): Promise<Product> {
    const product = await this.findOne(id, tenantId); // Ensures the product belongs to the tenant
    const updatedProduct = this.productRepository.merge(product, updateProductDto);
    return this.productRepository.save(updatedProduct);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const result = await this.productRepository.delete({ id, tenantId });
    if (result.affected === 0) {
      throw new NotFoundException(`Producto con ID "${id}" no encontrado.`);
    }
  }

  async updateProductImage(id: string, tenantId: string, file: Express.Multer.File): Promise<Product> {
    const product = await this.findOne(id, tenantId);
    const { url } = await this.filesService.uploadPublicFile(file);
    product.imageUrl = url;
    return this.productRepository.save(product);
  }

  async getIngredients(productId: string, tenantId: string): Promise<RecipeItem[]> {
    // First, verify the product belongs to the tenant
    await this.findOne(productId, tenantId);
    return this.recipeItemRepository.find({
      where: { productId },
      relations: ['ingredient'],
    });
  }

  async assignIngredients(
    productId: string,
    assignIngredientsDto: AssignIngredientsDto,
    tenantId: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.findOne(productId, tenantId); // Check ownership

      // Delete old recipe
      await queryRunner.manager.delete(RecipeItem, { productId });

      // Create new recipe items
      const newRecipeItems = assignIngredientsDto.ingredients.map((item) =>
        queryRunner.manager.create(RecipeItem, { productId, ...item }),
      );

      await queryRunner.manager.save(newRecipeItems);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}