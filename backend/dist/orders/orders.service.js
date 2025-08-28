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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
const product_entity_1 = require("../products/entities/product.entity");
const user_entity_1 = require("../users/entities/user.entity");
const ingredient_entity_1 = require("../ingredients/entities/ingredient.entity");
const inventory_movements_service_1 = require("../inventory-movements/inventory-movements.service");
const inventory_movement_type_enum_1 = require("../inventory-movements/enums/inventory-movement-type.enum");
let OrdersService = class OrdersService {
    constructor(orderRepository, customerRepository, productRepository, userRepository, ingredientRepository, inventoryMovementsService, dataSource) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.ingredientRepository = ingredientRepository;
        this.inventoryMovementsService = inventoryMovementsService;
        this.dataSource = dataSource;
    }
    async create(createOrderDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const { customerId, items, ...orderData } = createOrderDto;
            const customer = await queryRunner.manager.findOneBy(customer_entity_1.Customer, { id: customerId });
            if (!customer) {
                throw new common_1.NotFoundException(`El cliente con ID "${customerId}" no fue encontrado.`);
            }
            const order = queryRunner.manager.create(order_entity_1.Order, {
                ...orderData,
                customer,
                shortId: await this.generateShortId(),
                totalAmount: 0,
            });
            const savedOrder = await queryRunner.manager.save(order);
            let totalAmount = 0;
            const orderItems = [];
            for (const itemDto of items) {
                const product = await queryRunner.manager.findOne(product_entity_1.Product, {
                    where: { id: itemDto.productId },
                    relations: ['ingredients', 'ingredients.ingredient'],
                });
                if (!product) {
                    throw new common_1.NotFoundException(`El producto con ID "${itemDto.productId}" no fue encontrado.`);
                }
                if (!product.isAvailable) {
                    throw new common_1.BadRequestException(`El producto "${product.name}" no está disponible.`);
                }
                if (product.ingredients && product.ingredients.length > 0) {
                    for (const recipeItem of product.ingredients) {
                        const requiredQuantity = Number(recipeItem.quantityRequired) * itemDto.quantity;
                        const ingredient = recipeItem.ingredient;
                        if (Number(ingredient.stockQuantity) < requiredQuantity) {
                            throw new common_1.BadRequestException(`No hay suficiente stock de "${ingredient.name}" para completar el pedido.`);
                        }
                        await queryRunner.manager.decrement(ingredient_entity_1.Ingredient, { id: ingredient.id }, 'stockQuantity', requiredQuantity);
                        await this.inventoryMovementsService.logMovement({
                            ingredientId: ingredient.id,
                            quantityChange: -requiredQuantity,
                            type: inventory_movement_type_enum_1.TipoMovimientoInventario.DeduccionPorVenta,
                            orderId: savedOrder.id,
                            queryRunner,
                            reason: `Venta Pedido #${savedOrder.shortId}`,
                        });
                    }
                }
                const unitPrice = product.price;
                totalAmount += Number(unitPrice) * itemDto.quantity;
                const orderItem = queryRunner.manager.create(order_item_entity_1.OrderItem, {
                    orderId: savedOrder.id,
                    product,
                    quantity: itemDto.quantity,
                    unitPrice,
                    notes: itemDto.notes,
                });
                orderItems.push(orderItem);
            }
            await queryRunner.manager.save(orderItems);
            savedOrder.items = orderItems;
            savedOrder.totalAmount = totalAmount;
            const finalOrder = await queryRunner.manager.save(savedOrder);
            await queryRunner.commitTransaction();
            return finalOrder;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    findAll() {
        return this.orderRepository.find({
            relations: ['customer', 'items', 'items.product', 'assignedDriver'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['customer', 'items', 'items.product', 'assignedDriver'],
        });
        if (!order) {
            throw new common_1.NotFoundException(`El pedido con ID "${id}" no fue encontrado.`);
        }
        return order;
    }
    async update(id, updateOrderDto) {
        const { assignedDriverId, ...restOfDto } = updateOrderDto;
        const order = await this.orderRepository.preload({
            id,
            ...restOfDto,
        });
        if (!order) {
            throw new common_1.NotFoundException(`El pedido con ID "${id}" no fue encontrado.`);
        }
        if (assignedDriverId) {
            const driver = await this.userRepository.findOneBy({ id: assignedDriverId });
            if (!driver) {
                throw new common_1.NotFoundException(`El repartidor con ID "${assignedDriverId}" no fue encontrado.`);
            }
            order.assignedDriver = driver;
        }
        return this.orderRepository.save(order);
    }
    async remove(id) {
        const result = await this.orderRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`El pedido con ID "${id}" no fue encontrado.`);
        }
    }
    async generateShortId() {
        const lastOrder = await this.orderRepository.find({
            order: { createdAt: 'DESC' },
            take: 1,
        });
        const lastId = lastOrder.length > 0 ? parseInt(lastOrder[0].shortId.split('-')[1]) : 0;
        const newId = lastId + 1;
        return `P-${newId.toString().padStart(5, '0')}`;
    }
    async getSalesReport(queryDto) {
        const { startDate, endDate } = queryDto;
        const where = {};
        if (startDate || endDate) {
            const start = startDate ? new Date(startDate) : new Date(0);
            const end = endDate ? new Date(endDate) : new Date();
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            where.createdAt = (0, typeorm_2.Between)(start, end);
        }
        const orders = await this.orderRepository.find({
            where,
            relations: ['customer', 'items', 'items.product'],
            order: { createdAt: 'ASC' },
        });
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        const productsBreakdownMap = new Map();
        orders.forEach((order) => {
            order.items.forEach((item) => {
                if (item.product) {
                    const existingProduct = productsBreakdownMap.get(item.productId);
                    if (existingProduct) {
                        existingProduct.quantitySold += item.quantity;
                        existingProduct.totalRevenue += item.quantity * Number(item.unitPrice);
                    }
                    else {
                        productsBreakdownMap.set(item.productId, {
                            productName: item.product.name,
                            quantitySold: item.quantity,
                            totalRevenue: item.quantity * Number(item.unitPrice),
                        });
                    }
                }
            });
        });
        const productsBreakdown = Array.from(productsBreakdownMap.entries()).map(([productId, data]) => ({
            productId,
            ...data,
            totalRevenue: parseFloat(data.totalRevenue.toFixed(2)),
        }));
        return {
            reportPeriod: {
                from: startDate || 'N/A',
                to: endDate || 'N/A',
            },
            totalOrders: orders.length,
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            productsBreakdown,
            orders,
        };
    }
    async getIngredientConsumptionReport(queryDto) {
        const { startDate, endDate } = queryDto;
        const where = {};
        if (startDate || endDate) {
            const start = startDate ? new Date(startDate) : new Date(0);
            const end = endDate ? new Date(endDate) : new Date();
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            where.createdAt = (0, typeorm_2.Between)(start, end);
        }
        const orders = await this.orderRepository.find({
            where,
            relations: [
                'items',
                'items.product',
                'items.product.ingredients',
                'items.product.ingredients.ingredient',
            ],
        });
        const consumptionMap = new Map();
        orders.forEach((order) => {
            order.items.forEach((item) => {
                if (item.product && item.product.ingredients) {
                    item.product.ingredients.forEach((recipeItem) => {
                        if (recipeItem.ingredient) {
                            const ingredient = recipeItem.ingredient;
                            const consumedQuantity = Number(recipeItem.quantityRequired) * item.quantity;
                            const existingEntry = consumptionMap.get(ingredient.id);
                            if (existingEntry) {
                                existingEntry.totalConsumed += consumedQuantity;
                            }
                            else {
                                consumptionMap.set(ingredient.id, {
                                    ingredientName: ingredient.name,
                                    unit: ingredient.unit,
                                    totalConsumed: consumedQuantity,
                                });
                            }
                        }
                    });
                }
            });
        });
        const consumedIngredients = Array.from(consumptionMap.entries()).map(([ingredientId, data]) => ({
            ingredientId,
            ...data,
            totalConsumed: parseFloat(data.totalConsumed.toFixed(3)),
        }));
        return {
            reportPeriod: {
                from: startDate || 'N/A',
                to: endDate || 'N/A',
            },
            consumedIngredients,
        };
    }
    async getSalesForecast(queryDto) {
        const { period, duration } = queryDto;
        const predictionDuration = parseInt(duration, 10);
        const windowSize = 4;
        const queryBuilder = this.orderRepository.createQueryBuilder('order');
        const dateTrunc = period === 'weekly' ? 'week' : 'day';
        const historyStartDate = new Date();
        historyStartDate.setMonth(historyStartDate.getMonth() - 3);
        const historicalSales = await queryBuilder
            .select(`DATE_TRUNC('${dateTrunc}', "order"."createdAt")`, 'period_start')
            .addSelect('SUM(order.totalAmount)', 'total_sales')
            .where('"order"."createdAt" >= :historyStartDate', { historyStartDate })
            .groupBy('period_start')
            .orderBy('period_start', 'DESC')
            .limit(windowSize)
            .getRawMany();
        if (historicalSales.length < windowSize) {
            throw new common_1.BadRequestException(`No hay suficientes datos históricos (se necesitan ${windowSize} ${period === 'weekly' ? 'semanas' : 'días'}, se encontraron ${historicalSales.length}) para generar una predicción.`);
        }
        const totalSalesInWindow = historicalSales.reduce((sum, record) => sum + parseFloat(record.total_sales), 0);
        const averageSalesPerPeriod = totalSalesInWindow / windowSize;
        const forecast = [];
        const lastPeriodEndDate = new Date(historicalSales[0].period_start);
        for (let i = 1; i <= predictionDuration; i++) {
            const forecastDate = new Date(lastPeriodEndDate);
            if (period === 'weekly') {
                forecastDate.setDate(forecastDate.getDate() + 7 * i);
            }
            else {
                forecastDate.setDate(forecastDate.getDate() + i);
            }
            forecast.push({
                period: `Predicción para ${period === 'weekly' ? 'semana del' : 'día'} ${forecastDate.toISOString().split('T')[0]}`,
                predictedRevenue: parseFloat(averageSalesPerPeriod.toFixed(2)),
            });
        }
        return {
            predictionModel: 'Promedio Móvil Simple',
            parameters: {
                period,
                windowSize,
                predictionDuration,
            },
            historicalDataUsed: historicalSales
                .map((h) => ({
                period: new Date(h.period_start).toISOString().split('T')[0],
                revenue: parseFloat(h.total_sales),
            }))
                .reverse(),
            forecast,
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(ingredient_entity_1.Ingredient)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        inventory_movements_service_1.InventoryMovementsService,
        typeorm_2.DataSource])
], OrdersService);
//# sourceMappingURL=orders.service.js.map