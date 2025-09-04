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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const product_entity_1 = require("../products/entities/product.entity");
const ingredient_entity_1 = require("../ingredients/entities/ingredient.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const order_status_enum_1 = require("./enums/order-status.enum");
const inventory_movements_service_1 = require("../inventory-movements/inventory-movements.service");
const inventory_movement_type_enum_1 = require("../inventory-movements/enums/inventory-movement-type.enum");
const inventory_movement_entity_1 = require("../inventory-movements/entities/inventory-movement.entity");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
const notifications_service_1 = require("../notifications/notifications.service");
const geocoding_service_1 = require("../geocoding/geocoding.service");
const location_entity_1 = require("../locations/entities/location.entity");
const user_entity_1 = require("../users/entities/user.entity");
const order_types_enum_1 = require("./enums/order-types.enum");
const role_enum_1 = require("../roles/enums/role.enum");
const payments_service_1 = require("../payments/payments.service");
const delivery_provider_type_enum_1 = require("./enums/delivery-provider-type.enum");
let OrdersService = OrdersService_1 = class OrdersService {
    constructor(orderRepository, ingredientRepository, productRepository, userRepository, locationRepository, inventoryMovementsService, notificationsGateway, notificationsService, geocodingService, dataSource, paymentsService) {
        this.orderRepository = orderRepository;
        this.ingredientRepository = ingredientRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
        this.inventoryMovementsService = inventoryMovementsService;
        this.notificationsGateway = notificationsGateway;
        this.notificationsService = notificationsService;
        this.geocodingService = geocodingService;
        this.dataSource = dataSource;
        this.paymentsService = paymentsService;
        this.logger = new common_1.Logger(OrdersService_1.name);
    }
    async create(createOrderDto, tenantId, locationId, userId, initialStatus = order_status_enum_1.OrderStatus.PendingConfirmation) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const order = queryRunner.manager.create(order_entity_1.Order, {
                ...createOrderDto,
                tenantId,
                locationId,
                status: initialStatus,
                items: [],
            });
            const ingredientsToDeduct = [];
            let totalAmount = 0;
            let totalWeightKg = 0;
            let totalVolumeM3 = 0;
            for (const itemDto of createOrderDto.items) {
                const product = await queryRunner.manager.findOneBy(product_entity_1.Product, { id: itemDto.productId, locationId });
                if (!product)
                    throw new common_1.NotFoundException(`Producto con ID "${itemDto.productId}" no encontrado.`);
                const orderItem = queryRunner.manager.create(order_item_entity_1.OrderItem, { product, quantity: itemDto.quantity, unitPrice: product.price, notes: itemDto.notes });
                order.items.push(orderItem);
                totalAmount += product.price * itemDto.quantity;
                totalWeightKg += (Number(product.weightKg) || 0) * itemDto.quantity;
                totalVolumeM3 += (Number(product.volumeM3) || 0) * itemDto.quantity;
            }
            if (initialStatus === order_status_enum_1.OrderStatus.Confirmed || initialStatus === order_status_enum_1.OrderStatus.PendingConfirmation) {
                for (const itemDto of createOrderDto.items) {
                    const product = await queryRunner.manager.findOne(product_entity_1.Product, {
                        where: { id: itemDto.productId, locationId },
                        relations: ['ingredients'],
                    });
                    if (!product)
                        continue;
                    if (product.ingredients && product.ingredients.length > 0) {
                        for (const recipeItem of product.ingredients) {
                            const stockToDeduct = recipeItem.quantityRequired * itemDto.quantity;
                            await this.inventoryMovementsService.logMovement({
                                ingredientId: recipeItem.ingredientId,
                                userId,
                                orderId: 'temp',
                                type: inventory_movement_type_enum_1.InventoryMovementType.Sale,
                                quantityChange: -stockToDeduct,
                                reason: `Venta producto: ${product.name}`,
                            }, queryRunner.manager);
                        }
                    }
                }
            }
            order.totalAmount = totalAmount;
            order.totalWeightKg = totalWeightKg;
            order.totalVolumeM3 = totalVolumeM3;
            const preliminaryEstimate = new Date();
            preliminaryEstimate.setMinutes(preliminaryEstimate.getMinutes() + 45);
            order.estimatedDeliveryAt = preliminaryEstimate;
            if (order.orderType === 'delivery' && order.deliveryAddress) {
                const coords = await this.geocodingService.geocode(order.deliveryAddress, tenantId);
                if (coords) {
                    order.latitude = coords.lat;
                    order.longitude = coords.lng;
                    const location = await this.locationRepository.findOne({
                        where: { id: locationId },
                    });
                    if (location && location.deliveryArea) {
                        const isWithinArea = await this.isPointInDeliveryArea(coords.lat, coords.lng, location.id);
                        if (!isWithinArea) {
                            const outsideAreaNote = '¡ATENCIÓN! Pedido fuera del área de entrega.';
                            order.notes = order.notes
                                ? `${outsideAreaNote}\n${order.notes}`
                                : outsideAreaNote;
                            this.logger.warn(`Pedido para ${order.deliveryAddress} está fuera del área de entrega definida para la sucursal ${locationId}.`);
                        }
                    }
                }
            }
            const savedOrder = await queryRunner.manager.save(order);
            if (initialStatus === order_status_enum_1.OrderStatus.Confirmed || initialStatus === order_status_enum_1.OrderStatus.PendingConfirmation) {
                await queryRunner.manager.update(inventory_movement_entity_1.InventoryMovement, { orderId: 'temp', userId }, { orderId: savedOrder.id });
            }
            await queryRunner.commitTransaction();
            if (initialStatus === order_status_enum_1.OrderStatus.Confirmed || initialStatus === order_status_enum_1.OrderStatus.PendingConfirmation) {
                this.notificationsGateway.sendNewOrderToKitchen(tenantId, savedOrder);
                const checkedIngredientIds = new Set();
                for (const item of savedOrder.items) {
                    for (const recipeItem of item.product.ingredients) {
                        if (!recipeItem.ingredient || checkedIngredientIds.has(recipeItem.ingredientId))
                            continue;
                        checkedIngredientIds.add(recipeItem.ingredientId);
                        const ingredient = await this.ingredientRepository.findOneBy({ id: recipeItem.ingredientId });
                        if (ingredient && ingredient.stockQuantity <= ingredient.lowStockThreshold) {
                            this.notificationsService.createLowStockNotification(ingredient, tenantId).catch(console.error);
                        }
                    }
                }
            }
            return savedOrder;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async confirmOrderPayment(orderId, paymentGatewayId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const order = await queryRunner.manager.findOne(order_entity_1.Order, {
                where: { id: orderId },
                relations: ['items', 'items.product', 'items.product.ingredients'],
            });
            if (!order) {
                throw new common_1.NotFoundException(`Pedido con ID ${orderId} no encontrado para confirmar pago.`);
            }
            if (order.status !== order_status_enum_1.OrderStatus.PendingPayment) {
                this.logger.warn(`Intento de confirmar pago para un pedido que no está en estado pendiente. ID: ${orderId}, Estado actual: ${order.status}`);
                await queryRunner.rollbackTransaction();
                return order;
            }
            order.paymentStatus = order_types_enum_1.PaymentStatus.Paid;
            order.status = order_status_enum_1.OrderStatus.Confirmed;
            order.paymentGatewayId = paymentGatewayId;
            await this.inventoryMovementsService.recordSale(order, queryRunner.manager);
            const savedOrder = await queryRunner.manager.save(order);
            await queryRunner.commitTransaction();
            this.notificationsGateway.sendNewOrderToKitchen(order.tenantId, savedOrder);
            return savedOrder;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    findAll(tenantId, locationId) {
        const where = { tenantId };
        if (locationId) {
            where.locationId = locationId;
        }
        return this.orderRepository.find({
            where,
            relations: ['items', 'items.product', 'customer', 'assignedDriver'],
            order: { createdAt: 'DESC' },
        });
    }
    findByStatus(statuses, tenantId, locationId) {
        return this.orderRepository.find({
            where: { tenantId, locationId, status: (0, typeorm_2.In)(statuses) },
            relations: ['items', 'items.product', 'customer'],
            order: { createdAt: 'ASC' },
        });
    }
    findOrdersBetween(tenantId, locationId, startDate, endDate, statuses) {
        return this.orderRepository.find({
            where: {
                tenantId,
                locationId,
                status: (0, typeorm_2.In)(statuses),
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
    }
    async getOrderCountsByStatus(options, forDate = new Date()) {
        const { tenantId, locationId } = options;
        const startOfDay = new Date(forDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(forDate);
        endOfDay.setHours(23, 59, 59, 999);
        const qb = this.orderRepository.createQueryBuilder('order')
            .select('order.status', 'status')
            .addSelect('COUNT(order.id)::int', 'count')
            .where('order.createdAt BETWEEN :startOfDay AND :endOfDay', { startOfDay, endOfDay });
        if (locationId) {
            qb.andWhere('order.locationId = :locationId', { locationId });
        }
        else if (tenantId) {
            qb.innerJoin('order.location', 'location', 'location.tenantId = :tenantId', { tenantId });
        }
        const results = await qb
            .groupBy('order.status')
            .getRawMany();
        const stats = {
            confirmed: 0,
            in_preparation: 0,
            in_delivery: 0,
            delivered: 0,
        };
        for (const result of results) {
            if (stats.hasOwnProperty(result.status)) {
                stats[result.status] = result.count;
            }
        }
        return stats;
    }
    async getDriverPerformanceReport(tenantId, locationId, startDate, endDate) {
        const qb = this.orderRepository.createQueryBuilder('order')
            .select('order.assignedDriverId', 'driverId')
            .addSelect('driver.fullName', 'driverName')
            .addSelect('COUNT(order.id)', 'totalDeliveries')
            .addSelect('SUM(order.totalAmount::decimal)', 'totalAmountCollected')
            .addSelect(`AVG(EXTRACT(EPOCH FROM (order.deliveredAt - order.assignedAt)) / 60)`, 'averageDeliveryTimeMinutes')
            .innerJoin('order.assignedDriver', 'driver')
            .where('order.tenantId = :tenantId AND order.locationId = :locationId', { tenantId, locationId })
            .andWhere('order.status = :status', { status: order_status_enum_1.OrderStatus.Delivered })
            .andWhere('order.assignedDriverId IS NOT NULL')
            .andWhere("order.deliveryProvider = :deliveryProvider", { deliveryProvider: delivery_provider_type_enum_1.DeliveryProviderType.InHouse })
            .andWhere('order.deliveredAt IS NOT NULL')
            .andWhere('order.assignedAt IS NOT NULL');
        if (startDate) {
            qb.andWhere('order.deliveredAt >= :startDate', { startDate });
        }
        if (endDate) {
            const toDate = new Date(endDate);
            toDate.setDate(toDate.getDate() + 1);
            qb.andWhere('order.deliveredAt < :toDate', { toDate: toDate.toISOString().split('T')[0] });
        }
        qb.groupBy('order.assignedDriverId, driver.fullName')
            .orderBy('"totalDeliveries"', 'DESC');
        const rawReport = await qb.getRawMany();
        return rawReport.map(row => ({
            driverId: row.driverId,
            driverName: row.driverName,
            totalDeliveries: parseInt(row.totalDeliveries, 10),
            totalAmountCollected: parseFloat(row.totalAmountCollected),
            averageDeliveryTimeMinutes: row.averageDeliveryTimeMinutes ? parseFloat(row.averageDeliveryTimeMinutes).toFixed(2) : null,
        }));
    }
    async getDriverSettlementData(tenantId, locationId, startDate, endDate) {
        const orders = await this.orderRepository.find({
            where: {
                tenantId,
                locationId,
                status: order_status_enum_1.OrderStatus.Delivered,
                deliveredAt: (0, typeorm_2.Between)(startDate, endDate),
                assignedDriverId: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()),
                deliveryProvider: delivery_provider_type_enum_1.DeliveryProviderType.InHouse,
            },
            relations: ['assignedDriver'],
            order: {
                assignedDriver: { fullName: 'ASC' },
                deliveredAt: 'ASC',
            },
            select: {
                id: true,
                shortId: true,
                totalAmount: true,
                paymentMethod: true,
                deliveredAt: true,
                assignedDriverId: true,
                assignedDriver: {
                    id: true,
                    fullName: true,
                },
            },
        });
        const reportByDriver = new Map();
        for (const order of orders) {
            if (!order.assignedDriver)
                continue;
            const driverId = order.assignedDriver.id;
            if (!reportByDriver.has(driverId)) {
                reportByDriver.set(driverId, { driverId, driverName: order.assignedDriver.fullName, orders: [], totalCollected: 0, cashCollected: 0 });
            }
            const driverReport = reportByDriver.get(driverId);
            driverReport.orders.push({ shortId: order.shortId, totalAmount: Number(order.totalAmount), paymentMethod: order.paymentMethod, deliveredAt: order.deliveredAt });
            driverReport.totalCollected += Number(order.totalAmount);
            if (order.paymentMethod === order_types_enum_1.PaymentMethod.Cash) {
                driverReport.cashCollected += Number(order.totalAmount);
            }
        }
        return Array.from(reportByDriver.values());
    }
    async findOne(id, tenantId, locationId) {
        const where = { id, tenantId };
        if (locationId) {
            where.locationId = locationId;
        }
        const order = await this.orderRepository.findOne({ where, relations: ['items', 'items.product', 'customer', 'assignedDriver'] });
        if (!order) {
            throw new common_1.NotFoundException(`Pedido con ID "${id}" no encontrado o no pertenece a tu sucursal.`);
        }
        return order;
    }
    async update(id, updateOrderDto, tenantId, locationId) {
        const where = { id, tenantId };
        if (locationId) {
            where.locationId = locationId;
        }
        const existingOrder = await this.orderRepository.findOneBy(where);
        if (!existingOrder) {
            throw new common_1.NotFoundException(`Pedido con ID "${id}" no encontrado o no pertenece a tu sucursal.`);
        }
        const order = await this.orderRepository.preload({ id, ...updateOrderDto });
        if (!order) {
            throw new common_1.NotFoundException(`Pedido con ID "${id}" no encontrado.`);
        }
        return this.orderRepository.save(order);
    }
    async updateStatus(id, status, tenantId, locationId) {
        const order = await this.findOne(id, tenantId, locationId);
        const previousStatus = order.status;
        order.status = status;
        const updatedOrder = await this.orderRepository.save(order);
        if (status === order_status_enum_1.OrderStatus.ReadyForDelivery) {
            this.notificationsGateway.sendOrderReadyNotification(tenantId, updatedOrder);
        }
        this.notificationsGateway.sendOrderStatusUpdate(tenantId, {
            order: updatedOrder,
            previousStatus: previousStatus,
            newStatus: status,
        });
        return updatedOrder;
    }
    async updatePriority(id, isPriority, tenantId, locationId) {
        const order = await this.findOne(id, tenantId, locationId);
        order.isPriority = isPriority;
        const updatedOrder = await this.orderRepository.save(order);
        this.notificationsGateway.sendOrderPriorityUpdate(tenantId, updatedOrder);
        return updatedOrder;
    }
    async assignDriver(orderId, driverId, tenantId, locationId) {
        const order = await this.findOne(orderId, tenantId, locationId);
        if (order.deliveryProvider === delivery_provider_type_enum_1.DeliveryProviderType.External) {
            throw new common_1.BadRequestException('No se puede asignar un repartidor interno a un pedido de entrega externa.');
        }
        if (order.status !== order_status_enum_1.OrderStatus.ReadyForDelivery) {
            throw new common_1.BadRequestException('Solo se pueden asignar repartidores a pedidos que están listos para entrega.');
        }
        const driver = await this.userRepository.findOne({
            where: { id: driverId, locationId, role: { name: role_enum_1.RoleEnum.Delivery } },
        });
        if (!driver) {
            throw new common_1.NotFoundException(`Repartidor con ID "${driverId}" no encontrado o no tiene el rol correcto.`);
        }
        order.assignedDriverId = driver.id;
        order.status = order_status_enum_1.OrderStatus.InDelivery;
        order.assignedAt = new Date();
        const updatedOrder = await this.orderRepository.save(order);
        this.notificationsGateway.sendNewDeliveryToDriver(driver.id, updatedOrder);
        this.notificationsGateway.sendOrderAssigned(tenantId, updatedOrder);
        return updatedOrder;
    }
    async setPreparationTime(id, tenantId, locationId, setPreparationTimeDto) {
        const order = await this.findOne(id, tenantId, locationId);
        if (order.status !== order_status_enum_1.OrderStatus.Confirmed) {
            throw new common_1.BadRequestException('Solo se puede asignar tiempo de preparación a pedidos confirmados.');
        }
        order.preparationTimeMinutes = setPreparationTimeDto.preparationTimeMinutes;
        order.status = order_status_enum_1.OrderStatus.InPreparation;
        const now = new Date();
        order.estimatedDeliveryAt = new Date(now.getTime() + order.preparationTimeMinutes * 60000);
        return this.orderRepository.save(order);
    }
    async updateCoordinates(orderId, latitude, longitude, tenantId, locationId) {
        const order = await this.findOne(orderId, tenantId, locationId);
        order.latitude = latitude;
        order.longitude = longitude;
        const updatedOrder = await this.orderRepository.save(order);
        if (updatedOrder.assignedDriverId) {
            this.notificationsGateway.sendLocationUpdateToDriver(updatedOrder.assignedDriverId, updatedOrder);
        }
        return updatedOrder;
    }
    async isPointInDeliveryArea(latitude, longitude, locationId) {
        if (!latitude || !longitude) {
            return false;
        }
        const query = `
      SELECT ST_Contains(
        "deliveryArea",
        ST_SetSRID(ST_MakePoint($1, $2), 4326)
      ) as "isWithin"
      FROM "locations"
      WHERE "id" = $3
    `;
        try {
            const result = await this.locationRepository.query(query, [
                longitude,
                latitude,
                locationId,
            ]);
            if (result && result.length > 0) {
                return result[0].isWithin;
            }
            return false;
        }
        catch (error) {
            this.logger.error('Error al verificar el área de entrega con PostGIS', error);
            return false;
        }
    }
    async getSalesReport(tenantId, locationId, startDate, endDate) {
        const qb = this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'item')
            .leftJoinAndSelect('item.product', 'product')
            .where('order.tenantId = :tenantId AND order.locationId = :locationId', { tenantId, locationId })
            .andWhere('order.status != :cancelledStatus', { cancelledStatus: order_status_enum_1.OrderStatus.Cancelled });
        if (startDate) {
            qb.andWhere('order.createdAt >= :startDate', { startDate });
        }
        if (endDate) {
            const toDate = new Date(endDate);
            toDate.setDate(toDate.getDate() + 1);
            qb.andWhere('order.createdAt < :toDate', { toDate });
        }
        const orders = await qb.getMany();
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        const totalOrders = orders.length;
        const productsBreakdownMap = new Map();
        for (const order of orders) {
            for (const item of order.items) {
                if (!item.product)
                    continue;
                const revenue = item.quantity * Number(item.unitPrice);
                const existing = productsBreakdownMap.get(item.productId);
                if (existing) {
                    existing.quantitySold += item.quantity;
                    existing.totalRevenue += revenue;
                }
                else {
                    productsBreakdownMap.set(item.productId, {
                        productName: item.product.name,
                        quantitySold: item.quantity,
                        totalRevenue: revenue,
                    });
                }
            }
        }
        const productsBreakdown = Array.from(productsBreakdownMap.entries()).map(([productId, data]) => ({
            productId,
            ...data,
        })).sort((a, b) => b.totalRevenue - a.totalRevenue);
        return {
            reportPeriod: { from: startDate || 'inicio', to: endDate || 'ahora' },
            totalOrders,
            totalRevenue,
            productsBreakdown,
        };
    }
    async getIngredientConsumptionReport(tenantId, locationId, startDate, endDate) {
        const qb = this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'item')
            .leftJoinAndSelect('item.product', 'product')
            .leftJoinAndSelect('product.ingredients', 'productIngredient')
            .leftJoinAndSelect('productIngredient.ingredient', 'ingredient')
            .where('order.tenantId = :tenantId AND order.locationId = :locationId', { tenantId, locationId })
            .andWhere('order.status != :cancelledStatus', { cancelledStatus: order_status_enum_1.OrderStatus.Cancelled });
        if (startDate) {
            qb.andWhere('order.createdAt >= :startDate', { startDate });
        }
        if (endDate) {
            const toDate = new Date(endDate);
            toDate.setDate(toDate.getDate() + 1);
            qb.andWhere('order.createdAt < :toDate', { toDate });
        }
        const orders = await qb.getMany();
        const consumption = new Map();
        for (const order of orders) {
            for (const item of order.items) {
                if (!item.product || !item.product.ingredients)
                    continue;
                for (const recipeItem of item.product.ingredients) {
                    if (!recipeItem.ingredient)
                        continue;
                    const consumed = item.quantity * Number(recipeItem.quantityRequired);
                    const existing = consumption.get(recipeItem.ingredient.id);
                    if (existing) {
                        existing.totalConsumed += consumed;
                    }
                    else {
                        consumption.set(recipeItem.ingredient.id, {
                            ingredientName: recipeItem.ingredient.name,
                            unit: recipeItem.ingredient.unit,
                            totalConsumed: consumed,
                        });
                    }
                }
            }
        }
        const consumedIngredients = Array.from(consumption.entries()).map(([ingredientId, data]) => ({ ingredientId, ...data, }));
        return { reportPeriod: { from: startDate || 'inicio', to: endDate || 'ahora', }, consumedIngredients, };
    }
    async getProfitabilityReport(tenantId, locationId) {
        const products = await this.productRepository.find({
            where: { recipeIsSet: true, tenantId, locationId },
            relations: ['ingredients', 'ingredients.ingredient'],
        });
        const report = products.map(product => {
            const ingredientsCost = product.ingredients.reduce((total, recipeItem) => {
                const cost = recipeItem.ingredient ? Number(recipeItem.ingredient.costPerUnit) || 0 : 0;
                const quantity = Number(recipeItem.quantityRequired) || 0;
                return total + (quantity * cost);
            }, 0);
            const price = Number(product.price);
            const profit = price - ingredientsCost;
            const margin = price > 0 ? (profit / price) * 100 : 0;
            return {
                productId: product.id,
                productName: product.name,
                sellingPrice: price,
                ingredientsCost: Number(ingredientsCost.toFixed(2)),
                profit: Number(profit.toFixed(2)),
                margin: Number(margin.toFixed(2)),
            };
        });
        return report.sort((a, b) => a.profit - b.profit);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(ingredient_entity_1.Ingredient)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(location_entity_1.Location)),
    __param(10, (0, common_1.Inject)((0, common_1.forwardRef)(() => payments_service_1.PaymentsService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        inventory_movements_service_1.InventoryMovementsService,
        notifications_gateway_1.NotificationsGateway,
        notifications_service_1.NotificationsService,
        geocoding_service_1.GeocodingService,
        typeorm_2.DataSource,
        payments_service_1.PaymentsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map