import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { InventoryMovementType } from './enums/inventory-movement-type.enum';

@Injectable()
export class InventoryMovementsService {
  constructor(
    @InjectRepository(InventoryMovement)
    private readonly movementRepository: Repository<InventoryMovement>,
  ) {}

  async logMovement(
    movementData: Partial<InventoryMovement>,
    manager: EntityManager,
  ): Promise<InventoryMovement> {
    const movement = manager.create(InventoryMovement, movementData);
    return manager.save(movement);
  }

  findAllForIngredient(ingredientId: string, tenantId: string) {
    return this.movementRepository.find({
      where: { ingredientId, tenantId },
      order: { createdAt: 'DESC' },
    });
  }
}