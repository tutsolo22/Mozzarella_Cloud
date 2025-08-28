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
    create(createIngredientDto) {
        const ingredient = this.ingredientRepository.create(createIngredientDto);
        return this.ingredientRepository.save(ingredient);
    }
    findAll() {
        return this.ingredientRepository.find();
    }
    async findOne(id) {
        const ingredient = await this.ingredientRepository.findOneBy({ id });
        if (!ingredient) {
            throw new common_1.NotFoundException(`El ingrediente con ID "${id}" no fue encontrado.`);
        }
        return ingredient;
    }
    async update(id, updateIngredientDto) {
        const ingredient = await this.ingredientRepository.preload({
            id,
            ...updateIngredientDto,
        });
        if (!ingredient) {
            throw new common_1.NotFoundException(`El ingrediente con ID "${id}" no fue encontrado.`);
        }
        return this.ingredientRepository.save(ingredient);
    }
    async remove(id) {
        const result = await this.ingredientRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`El ingrediente con ID "${id}" no fue encontrado.`);
        }
    }
    async purchase(purchaseDto, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (const item of purchaseDto.ingredients) {
                const ingredient = await queryRunner.manager.findOneBy(ingredient_entity_1.Ingredient, {
                    id: item.ingredientId,
                });
                if (!ingredient) {
                    throw new common_1.NotFoundException(`El ingrediente con ID "${item.ingredientId}" no fue encontrado.`);
                }
                await queryRunner.manager.increment(ingredient_entity_1.Ingredient, { id: item.ingredientId }, 'stockQuantity', item.quantity);
                await this.inventoryMovementsService.logMovement({
                    ingredientId: item.ingredientId,
                    quantityChange: item.quantity,
                    type: inventory_movement_type_enum_1.TipoMovimientoInventario.Compra,
                    userId,
                    queryRunner,
                    reason: 'Compra de insumos',
                });
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
    async registerWaste(registerWasteDto, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (const item of registerWasteDto.items) {
                const ingredient = await queryRunner.manager.findOneBy(ingredient_entity_1.Ingredient, {
                    id: item.ingredientId,
                });
                if (!ingredient) {
                    throw new common_1.NotFoundException(`El ingrediente con ID "${item.ingredientId}" no fue encontrado.`);
                }
                if (Number(ingredient.stockQuantity) < item.quantity) {
                    throw new common_1.BadRequestException(`No se puede registrar una merma de ${item.quantity} para "${ingredient.name}" porque solo hay ${ingredient.stockQuantity} en stock.`);
                }
                await queryRunner.manager.decrement(ingredient_entity_1.Ingredient, { id: item.ingredientId }, 'stockQuantity', item.quantity);
                await this.inventoryMovementsService.logMovement({
                    ingredientId: item.ingredientId,
                    quantityChange: -item.quantity,
                    type: inventory_movement_type_enum_1.TipoMovimientoInventario.Merma,
                    userId,
                    queryRunner,
                    reason: item.reason || 'Merma registrada',
                });
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
    async getMovementHistory(ingredientId) {
        await this.findOne(ingredientId);
        return this.movementRepository.find({
            where: { ingredientId },
            order: { createdAt: 'DESC' },
            relations: ['user', 'order'],
        });
    }
    async adjustStock(adjustStockDto, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (const item of adjustStockDto.items) {
                const ingredient = await queryRunner.manager.findOneBy(ingredient_entity_1.Ingredient, {
                    id: item.ingredientId,
                });
                if (!ingredient) {
                    throw new common_1.NotFoundException(`El ingrediente con ID "${item.ingredientId}" no fue encontrado.`);
                }
                const currentStock = Number(ingredient.stockQuantity);
                const newStock = item.newQuantity;
                const quantityChange = newStock - currentStock;
                if (quantityChange !== 0) {
                    ingredient.stockQuantity = newStock;
                    await queryRunner.manager.save(ingredient);
                    await this.inventoryMovementsService.logMovement({
                        ingredientId: item.ingredientId,
                        quantityChange: quantityChange,
                        type: inventory_movement_type_enum_1.TipoMovimientoInventario.Ajuste,
                        userId,
                        queryRunner,
                        reason: item.reason,
                    });
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
    async getWasteReport(queryDto) {
        const { startDate, endDate } = queryDto;
        const where = {
            type: inventory_movement_type_enum_1.TipoMovimientoInventario.Merma,
        };
        if (startDate || endDate) {
            const start = startDate ? new Date(startDate) : new Date(0);
            const end = endDate ? new Date(endDate) : new Date();
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            where.createdAt = (0, typeorm_2.Between)(start, end);
        }
        const wasteMovements = await this.movementRepository.find({
            where,
            relations: ['ingredient', 'user'],
            order: { createdAt: 'DESC' },
        });
        const totalWasteEntries = wasteMovements.length;
        const ingredientBreakdown = new Map();
        wasteMovements.forEach((movement) => {
            const wastedQuantity = Math.abs(Number(movement.quantityChange));
            if (movement.ingredient) {
                const existing = ingredientBreakdown.get(movement.ingredientId);
                if (existing) {
                    existing.totalQuantity += wastedQuantity;
                    existing.entries += 1;
                }
                else {
                    ingredientBreakdown.set(movement.ingredientId, {
                        ingredientName: movement.ingredient.name,
                        unit: movement.ingredient.unit,
                        totalQuantity: wastedQuantity,
                        entries: 1,
                    });
                }
            }
        });
        const summary = Array.from(ingredientBreakdown.entries()).map(([ingredientId, data]) => ({
            ingredientId,
            ...data,
            totalQuantity: parseFloat(data.totalQuantity.toFixed(3)),
        }));
        return {
            reportPeriod: {
                from: startDate || 'N/A',
                to: endDate || 'N/A',
            },
            totalWasteEntries,
            summary,
            details: wasteMovements,
        };
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