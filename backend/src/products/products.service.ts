import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesService } from '../files/files.service';
import { ProductIngredient } from './entities/product-ingredient.entity';
import { AssignIngredientsDto } from './dto/assign-ingredients.dto';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { CsvService } from '../csv/csv.service';
import { ProductCategory } from './entities/product-category.entity';
import * as path from 'path';
import 'multer';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductIngredient)
    private readonly productIngredientRepository: Repository<ProductIngredient>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
    private readonly filesService: FilesService,
    private readonly csvService: CsvService,
    private readonly dataSource: DataSource,
  ) {}

  create(dto: CreateProductDto, tenantId: string, locationId: string): Promise<Product> {
    const product = this.productRepository.create({
      ...dto,
      tenantId,
      locationId,
    });
    return this.productRepository.save(product);
  }

  findAll(tenantId: string, locationId: string, includeUnavailable: boolean): Promise<Product[]> {
    const where: FindOptionsWhere<Product> = {
      tenantId,
      locationId,
    };

    if (!includeUnavailable) {
      where.isAvailable = true;
    }

    return this.productRepository.find({
      where,
      relations: ['category', 'preparationZone'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, tenantId: string, locationId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, tenantId, locationId },
      relations: ['category', 'preparationZone'],
    });
    if (!product) {
      throw new NotFoundException(`Producto con ID #${id} no encontrado.`);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto, tenantId: string, locationId: string): Promise<Product> {
    const product = await this.productRepository.preload({
      id,
      tenantId,
      locationId,
      ...dto,
    });
    if (!product) {
      throw new NotFoundException(`Producto con ID #${id} no encontrado.`);
    }
    return this.productRepository.save(product);
  }

  async disable(id: string, tenantId: string, locationId: string): Promise<void> {
    const result = await this.productRepository.softDelete({ id, tenantId, locationId });
    if (result.affected === 0) {
      throw new NotFoundException(`Producto con ID #${id} no encontrado.`);
    }
  }

  async enable(id: string, tenantId: string, locationId: string): Promise<void> {
    const result = await this.productRepository.restore({ id, tenantId, locationId });
    if (result.affected === 0) {
      throw new NotFoundException(`Producto con ID #${id} no encontrado.`);
    }
  }

  async updateImage(id: string, file: Express.Multer.File, tenantId: string, locationId: string): Promise<Product> {
    const product = await this.findOne(id, tenantId, locationId);

    if (product.imageUrl) {
      try {
        const oldFileKey = path.basename(product.imageUrl);
        await this.filesService.deletePublicFile(oldFileKey, tenantId);
      } catch (error) {
        this.logger.warn(`No se pudo eliminar la imagen anterior del producto: ${error.message}`);
      }
    }

    const { url } = await this.filesService.uploadPublicFile(file, tenantId);
    return this.update(id, { imageUrl: url }, tenantId, locationId);
  }

  async getIngredients(id: string, tenantId: string, locationId: string): Promise<ProductIngredient[]> {
    const product = await this.productRepository.findOne({
      where: { id, tenantId, locationId },
      relations: ['ingredients', 'ingredients.ingredient'],
    });
    if (!product) {
      throw new NotFoundException(`Producto con ID "${id}" no encontrado.`);
    }
    return product.ingredients;
  }

  async assignIngredients(id: string, assignIngredientsDto: AssignIngredientsDto, tenantId: string, locationId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOneBy(Product, { id, tenantId, locationId });
      if (!product) throw new NotFoundException(`Producto con ID "${id}" no encontrado.`);

      await queryRunner.manager.delete(ProductIngredient, { productId: id });

      const { ingredients } = assignIngredientsDto;
      if (ingredients && ingredients.length > 0) {
        const ingredientIds = ingredients.map(i => i.ingredientId);
        const availableIngredients = await queryRunner.manager.findBy(Ingredient, { id: In(ingredientIds), tenantId, locationId });
        if (availableIngredients.length !== ingredientIds.length) {
          throw new BadRequestException('Uno o más ingredientes no existen o no pertenecen a esta sucursal.');
        }

        const productIngredients = ingredients.map(item => queryRunner.manager.create(ProductIngredient, {
          productId: id,
          ingredientId: item.ingredientId,
          quantityRequired: item.quantityRequired,
        }));

        await queryRunner.manager.save(productIngredients);
        product.recipeIsSet = true;
      } else {
        product.recipeIsSet = false;
      }

      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error al asignar ingredientes al producto ${id}:`, error);
      throw new InternalServerErrorException('Error al asignar ingredientes.');
    } finally {
      await queryRunner.release();
    }
  }

  async exportProductsToCsv(tenantId: string): Promise<string> {
    const products = await this.productRepository.find({
      where: { tenantId },
      relations: ['category'],
      order: { category: { name: 'ASC' }, name: 'ASC' },
    });

    const data = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      isAvailable: p.isAvailable,
      category: p.category?.name || '',
      weightKg: p.weightKg,
      volumeM3: p.volumeM3,
    }));

    return this.csvService.stringify(data, { header: true });
  }

  async importProductsFromCsv(file: Express.Multer.File, tenantId: string, locationId: string): Promise<{ created: number; updated: number; errors: string[] }> {
    const results = { created: 0, updated: 0, errors: [] as string[] };
    const parsedData: any[] = await this.csvService.parse(file.buffer);

    for (const row of parsedData) {
      try {
        const { name, description, price, isAvailable, category: categoryName, weightKg, volumeM3 } = row;
        if (!name || !price) {
          results.errors.push(`Fila ignorada: faltan 'name' o 'price'. Fila: ${JSON.stringify(row)}`);
          continue;
        }

        let category: ProductCategory | null = null;
        if (categoryName) {
          category = await this.categoryRepository.findOneBy({ name: categoryName, tenantId });
          if (!category) {
            category = await this.categoryRepository.save(this.categoryRepository.create({ name: categoryName, tenantId }));
          }
        }

        const productData = { name, description, price: parseFloat(price), isAvailable: isAvailable ? ['true', '1'].includes(isAvailable.toLowerCase()) : true, tenantId, locationId, categoryId: category?.id, weightKg: weightKg ? parseFloat(weightKg) : 0, volumeM3: volumeM3 ? parseFloat(volumeM3) : 0 };

        const existingByName = await this.productRepository.findOneBy({ name, tenantId, locationId });
        if (existingByName) {
          await this.productRepository.update(existingByName.id, productData);
          results.updated++;
        } else {
          await this.productRepository.save(this.productRepository.create(productData));
          results.created++;
        }
      } catch (error) {
        results.errors.push(`Error procesando fila ${JSON.stringify(row)}: ${error.message}`);
      }
    }
    return results;
  }
}