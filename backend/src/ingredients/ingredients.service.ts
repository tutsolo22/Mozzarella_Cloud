import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, FindOptionsWhere, Between } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { InventoryMovementsService } from '../inventory-movements/inventory-movements.service';
import { InventoryMovementType } from '../inventory-movements/enums/inventory-movement-type.enum';
import { InventoryMovement } from '../inventory-movements/entities/inventory-movement.entity';
import { PurchaseIngredientsDto } from './dto/purchase-ingredients.dto';
import { RegisterWasteDto } from './dto/register-waste.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
    @InjectRepository(InventoryMovement)
    private readonly movementRepository: Repository<InventoryMovement>,
    private readonly inventoryMovementsService: InventoryMovementsService,
    private readonly dataSource: DataSource,
  ) {}

  create(createIngredientDto: CreateIngredientDto, tenantId: string) {
    const ingredient = this.ingredientRepository.create({ ...createIngredientDto, tenantId });
    return this.ingredientRepository.save(ingredient);
  }

  findAll(tenantId: string) {
    return this.ingredientRepository.find({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string) {
    const ingredient = await this.ingredientRepository.findOneBy({ id, tenantId });
    if (!ingredient) {
      throw new NotFoundException(`El ingrediente con ID "${id}" no fue encontrado.`);
    }
    return ingredient;
  }

  async update(id: string, updateIngredientDto: UpdateIngredientDto, tenantId: string) {
    // Primero, nos aseguramos de que el ingrediente pertenezca al tenant
    await this.findOne(id, tenantId); 
    const ingredient = await this.ingredientRepository.preload({
      id,
      ...updateIngredientDto,
    });
    return this.ingredientRepository.save(ingredient);
  }

  async remove(id: string, tenantId: string) {
    const result = await this.ingredientRepository.delete({ id, tenantId });
    if (result.affected === 0) {
      throw new NotFoundException(`El ingrediente con ID "${id}" no fue encontrado.`);
    }
  }

  async purchase(purchaseDto: PurchaseIngredientsDto, userId: string, tenantId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of purchaseDto.ingredients) {
        const ingredient = await queryRunner.manager.findOneBy(Ingredient, {
          id: item.ingredientId,
          tenantId, // <-- CORRECCIÓN CLAVE
        });
        if (!ingredient) {
          throw new NotFoundException(`El ingrediente con ID "${item.ingredientId}" no fue encontrado.`);
        }

        await queryRunner.manager.increment(Ingredient, { id: item.ingredientId, tenantId }, 'stockQuantity', item.quantity);

        await this.inventoryMovementsService.logMovement({
          tenantId,
          ingredientId: item.ingredientId,
          quantityChange: item.quantity,
          type: InventoryMovementType.Purchase,
          userId,
          reason: 'Compra de insumos',
        }, queryRunner.manager);
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async registerWaste(registerWasteDto: RegisterWasteDto, userId: string, tenantId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of registerWasteDto.items) {
        const ingredient = await queryRunner.manager.findOneBy(Ingredient, {
          id: item.ingredientId,
          tenantId, // <-- CORRECCIÓN CLAVE
        });
        if (!ingredient) {
          throw new NotFoundException(`El ingrediente con ID "${item.ingredientId}" no fue encontrado.`);
        }

        if (Number(ingredient.stockQuantity) < item.quantity) {
          throw new BadRequestException(`No se puede registrar una merma de ${item.quantity} para "${ingredient.name}" porque solo hay ${ingredient.stockQuantity} en stock.`);
        }

        await queryRunner.manager.decrement(Ingredient, { id: item.ingredientId, tenantId }, 'stockQuantity', item.quantity);

        await this.inventoryMovementsService.logMovement({
          tenantId,
          ingredientId: item.ingredientId,
          quantityChange: -item.quantity,
          type: InventoryMovementType.Waste,
          userId,
          reason: item.reason || 'Merma registrada',
        }, queryRunner.manager);
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async adjustStock(adjustStockDto: AdjustStockDto, userId: string, tenantId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of adjustStockDto.items) {
        const ingredient = await queryRunner.manager.findOneBy(Ingredient, {
          id: item.ingredientId,
          tenantId,
        });

        if (!ingredient) {
          throw new NotFoundException(`El ingrediente con ID "${item.ingredientId}" no fue encontrado.`);
        }

        const quantityChange = item.newQuantity - Number(ingredient.stockQuantity);

        if (quantityChange !== 0) {
          ingredient.stockQuantity = item.newQuantity;
          await queryRunner.manager.save(ingredient);

          await this.inventoryMovementsService.logMovement({
            tenantId,
            ingredientId: item.ingredientId,
            quantityChange,
            type: InventoryMovementType.Adjustment,
            userId,
            reason: item.reason,
          }, queryRunner.manager);
        }
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getMovementHistory(ingredientId: string, tenantId: string): Promise<InventoryMovement[]> {
    // Primero, nos aseguramos de que el ingrediente exista y pertenezca al tenant
    await this.findOne(ingredientId, tenantId);

    return this.movementRepository.find({
      where: { ingredientId, tenantId },
      relations: ['user', 'order'], // Incluimos detalles del usuario y del pedido si existen
      order: { createdAt: 'DESC' },
    });
  }

  async getWasteReport(tenantId: string, locationId: string, queryDto: { startDate?: string, endDate?: string }) {
    const { startDate, endDate } = queryDto;
    const qb = this.movementRepository.createQueryBuilder('movement')
      .innerJoinAndSelect('movement.ingredient', 'ingredient')
      .where('movement.tenantId = :tenantId', { tenantId })
      .andWhere('movement.locationId = :locationId', { locationId })
      .andWhere('movement.type = :type', { type: InventoryMovementType.Waste });

    if (startDate) {
      qb.andWhere('movement.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      const toDate = new Date(endDate);
      toDate.setDate(toDate.getDate() + 1);
      qb.andWhere('movement.createdAt < :toDate', { toDate });
    }

    const wasteMovements = await qb.getMany();
    // ... el resto de la lógica para construir el reporte
    return { /* ... */ };
  }

  // ... otros métodos como adjustStock deben seguir el mismo patrón
}