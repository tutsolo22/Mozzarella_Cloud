"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngredientsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ingredient_entity_1 = require("./entities/ingredient.entity");
const inventory_movements_service_1 = require("../inventory-movements/inventory-movements.service");
const inventory_movement_type_enum_1 = require("../inventory-movements/enums/inventory-movement-type.enum");
const inventory_movement_entity_1 = require("../inventory-movements/entities/inventory-movement.entity");
let IngredientsService = class IngredientsService {
    constructor(ingredientRepository, movementRepository, inventoryMovementsService, dataSource) {
        this.ingredientRepository = ingredientRepository;
        this.movementRepository = movementRepository;
        this.inventoryMovementsService = inventoryMovementsService;
        this.dataSource = dataSource;
    }
    create(createIngredientDto, tenantId) {
        const ingredient = this.ingredientRepository.create({ ...createIngredientDto, tenantId });
        return this.ingredientRepository.save(ingredient);
    }
    findAll(tenantId) {
        return this.ingredientRepository.find({ where: { tenantId } });
    }
    async findOne(id, tenantId) {
        const ingredient = await this.ingredientRepository.findOneBy({ id, tenantId });
        if (!ingredient) {
            throw new common_1.NotFoundException(`El ingrediente con ID "${id}" no fue encontrado.`);
        }
        return ingredient;
    }
    async update(id, updateIngredientDto, tenantId) {
        await this.findOne(id, tenantId);
        const ingredient = await this.ingredientRepository.preload({
            id,
            ...updateIngredientDto,
        });
        return this.ingredientRepository.save(ingredient);
    }
    async remove(id, tenantId) {
        const result = await this.ingredientRepository.delete({ id, tenantId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`El ingrediente con ID "${id}" no fue encontrado.`);
        }
    }
    async purchase(purchaseDto, userId, tenantId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (const item of purchaseDto.ingredients) {
                const ingredient = await queryRunner.manager.findOneBy(ingredient_entity_1.Ingredient, {
                    id: item.ingredientId,
                    tenantId,
                });
                if (!ingredient) {
                    throw new common_1.NotFoundException(`El ingrediente con ID "${item.ingredientId}" no fue encontrado.`);
                }
                await queryRunner.manager.increment(ingredient_entity_1.Ingredient, { id: item.ingredientId, tenantId }, 'stockQuantity', item.quantity);
                await this.inventoryMovementsService.logMovement({
                    tenantId,
                    ingredientId: item.ingredientId,
                    quantityChange: item.quantity,
                    type: inventory_movement_type_enum_1.InventoryMovementType.Purchase,
                    userId,
                    reason: 'Compra de insumos',
                }, queryRunner.manager);
            }
            await queryRunner.commitTransaction();
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async registerWaste(registerWasteDto, userId, tenantId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (const item of registerWasteDto.items) {
                const ingredient = await queryRunner.manager.findOneBy(ingredient_entity_1.Ingredient, {
                    id: item.ingredientId,
                    tenantId,
                });
                if (!ingredient) {
                    throw new common_1.NotFoundException(`El ingrediente con ID "${item.ingredientId}" no fue encontrado.`);
                }
                if (Number(ingredient.stockQuantity) < item.quantity) {
                    throw new common_1.BadRequestException(`No se puede registrar una merma de ${item.quantity} para "${ingredient.name}" porque solo hay ${ingredient.stockQuantity} en stock.`);
                }
                await queryRunner.manager.decrement(ingredient_entity_1.Ingredient, { id: item.ingredientId, tenantId }, 'stockQuantity', item.quantity);
                await this.inventoryMovementsService.logMovement({
                    tenantId,
                    ingredientId: item.ingredientId,
                    quantityChange: -item.quantity,
                    type: inventory_movement_type_enum_1.InventoryMovementType.Waste,
                    userId,
                    reason: item.reason || 'Merma registrada',
                }, queryRunner.manager);
            }
            await queryRunner.commitTransaction();
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async adjustStock(adjustStockDto, userId, tenantId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (const item of adjustStockDto.items) {
                const ingredient = await queryRunner.manager.findOneBy(ingredient_entity_1.Ingredient, {
                    id: item.ingredientId,
                    tenantId,
                });
                if (!ingredient) {
                    throw new common_1.NotFoundException(`El ingrediente con ID "${item.ingredientId}" no fue encontrado.`);
                }
                const quantityChange = item.newQuantity - Number(ingredient.stockQuantity);
                if (quantityChange !== 0) {
                    ingredient.stockQuantity = item.newQuantity;
                    await queryRunner.manager.save(ingredient);
                    await this.inventoryMovementsService.logMovement({
                        tenantId,
                        ingredientId: item.ingredientId,
                        quantityChange,
                        type: inventory_movement_type_enum_1.InventoryMovementType.Adjustment,
                        userId,
                        reason: item.reason,
                    }, queryRunner.manager);
                }
            }
            await queryRunner.commitTransaction();
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getMovementHistory(ingredientId, tenantId) {
        await this.findOne(ingredientId, tenantId);
        return this.movementRepository.find({
            where: { ingredientId, tenantId },
            relations: ['user', 'order'],
            order: { createdAt: 'DESC' },
        });
    }
    async getWasteReport(tenantId, locationId, queryDto) {
        const { startDate, endDate } = queryDto;
        const qb = this.movementRepository.createQueryBuilder('movement')
            .innerJoinAndSelect('movement.ingredient', 'ingredient')
            .where('movement.tenantId = :tenantId', { tenantId })
            .andWhere('movement.locationId = :locationId', { locationId })
            .andWhere('movement.type = :type', { type: inventory_movement_type_enum_1.InventoryMovementType.Waste });
        if (startDate) {
            qb.andWhere('movement.createdAt >= :startDate', { startDate });
        }
        if (endDate) {
            const toDate = new Date(endDate);
            toDate.setDate(toDate.getDate() + 1);
            qb.andWhere('movement.createdAt < :toDate', { toDate });
        }
        const wasteMovements = await qb.getMany();
        return {};
    }
};
exports.IngredientsService = IngredientsService;
exports.IngredientsService = IngredientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ingredient_entity_1.Ingredient)),
    __param(1, (0, typeorm_1.InjectRepository)(inventory_movement_entity_1.InventoryMovement)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        inventory_movements_service_1.InventoryMovementsService,
        typeorm_2.DataSource])
], IngredientsService);
//# sourceMappingURL=ingredients.service.js.map