import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, In, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductCategory } from './entities/product-category.entity';
import { FilesService } from '../files/files.service';
import 'multer';
import { RecipeItem } from './entities/recipe-item.entity';
import { AssignIngredientsDto } from './dto/assign-ingredients.dto';
import { OrderItem } from '../orders/entities/order-item.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
    @InjectRepository(RecipeItem) // Assuming RecipeItem is an alias for ProductIngredient or similar
    private readonly recipeItemRepository: Repository<RecipeItem>, 
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly dataSource: DataSource,
    private readonly filesService: FilesService,
  ) {}

  async create(createProductDto: CreateProductDto, tenantId: string, locationId: string): Promise<Product> {
    const { categoryId, ...rest } = createProductDto;
    const category = await this.categoryRepository.findOneBy({ id: categoryId });
    if (!category) {
      throw new NotFoundException(`Categoría con ID "${categoryId}" no encontrada.`);
    }
    const product = this.productRepository.create({
      ...rest,
      tenantId,
      locationId,
      category,
    });
    return this.productRepository.save(product);
  }

  findAll(tenantId: string, locationId: string, includeInactive: boolean = false): Promise<Product[]> {
    const where: FindOptionsWhere<Product> = { tenantId, locationId };
    return this.productRepository.find({
      where,
      relations: ['category'],
      order: { name: 'ASC' },
      withDeleted: includeInactive,
    });
  }

  async findOne(id: string, tenantId: string, locationId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, tenantId, locationId },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Producto con ID "${id}" no encontrado.`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, tenantId: string, locationId: string): Promise<Product> {
    const product = await this.productRepository.preload({
      id,
      tenantId,
      locationId,
      ...updateProductDto,
    });
    if (!product) {
      throw new NotFoundException(`Producto con ID "${id}" no encontrado.`);
    }
    return this.productRepository.save(product);
  }

  async disable(id: string, tenantId: string, locationId: string): Promise<void> {
    // Primero, nos aseguramos que el producto exista y pertenezca al tenant/sucursal.
    const product = await this.productRepository.findOneBy({ id, tenantId, locationId });
    if (!product) {
      throw new NotFoundException(`Producto con ID "${id}" no encontrado.`);
    }

    // CRITICAL VALIDATION: Check if the product is part of any order.
    const orderCount = await this.orderItemRepository.count({
      where: { productId: id },
    });

    if (orderCount > 0) {
      throw new ConflictException(
        `No se puede deshabilitar el producto "${product.name}" porque está asociado a ${orderCount} pedidos existentes.`,
      );
    }

    // Si no hay pedidos asociados, procedemos con el borrado lógico.
    const result = await this.productRepository.softDelete({ id, tenantId, locationId });
    if (result.affected === 0) {
      throw new NotFoundException(`Producto con ID "${id}" no encontrado o ya está deshabilitado.`);
    }
  }

  async enable(id: string, tenantId: string, locationId: string): Promise<void> {
    await this.productRepository.restore({ id, tenantId, locationId });
  }

  async updateImage(id: string, file: Express.Multer.File, tenantId: string, locationId: string): Promise<Product> {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo.');
    }
    const product = await this.findOne(id, tenantId, locationId);
    const { url } = await this.filesService.uploadPublicFile(file, `tenants/${tenantId}/products`);
    product.imageUrl = url;
    return this.productRepository.save(product);
  }

  async getIngredients(productId: string, tenantId: string, locationId: string): Promise<RecipeItem[]> {
    // First, verify the product belongs to the tenant
    await this.findOne(productId, tenantId, locationId);
    return this.recipeItemRepository.find({
      where: { productId },
      relations: ['ingredient'],
    });
  }

  async assignIngredients(
    productId: string,
    assignIngredientsDto: AssignIngredientsDto,
    tenantId: string,
    locationId: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify product ownership within the transaction
      const product = await queryRunner.manager.findOneBy(Product, { id: productId, tenantId, locationId });
      if (!product) {
        throw new NotFoundException(`Producto con ID "${productId}" no encontrado en tu sucursal.`);
      }

      // Delete old recipe
      await queryRunner.manager.delete(RecipeItem, { productId });

      // Create new recipe items
      if (assignIngredientsDto.ingredients && assignIngredientsDto.ingredients.length > 0) {
        const newRecipeItems = assignIngredientsDto.ingredients.map((item) =>
          queryRunner.manager.create(RecipeItem, { productId, ...item }),
        );
        await queryRunner.manager.save(newRecipeItems);
        product.recipeIsSet = true;
      } else {
        product.recipeIsSet = false;
      }

      // Update the product's recipe status
      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}