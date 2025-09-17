import { Injectable, NotFoundException, BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In, Between, Not, IsNull, FindOptionsWhere } from 'typeorm';
import { Order } from './entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from './enums/order-status.enum';
import { InventoryMovementsService } from '../inventory-movements/inventory-movements.service';
import { InventoryMovementType } from '../inventory-movements/enums/inventory-movement-type.enum';
import { InventoryMovement } from '../inventory-movements/entities/inventory-movement.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { GeocodingService } from '../geocoding/geocoding.service';
import { Location } from '../locations/entities/location.entity';
import { SetPreparationTimeDto } from './dto/set-preparation-time.dto';
import { User } from '../users/entities/user.entity';
import { PaymentMethod, PaymentStatus } from './enums/order-types.enum';
import { RoleEnum } from '../roles/enums/role.enum';
import { PaymentsService } from '../payments/payments.service';
import { DeliveryProviderType } from '../delivery/enums/delivery-provider-type.enum';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly inventoryMovementsService: InventoryMovementsService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly notificationsService: NotificationsService,
    private readonly geocodingService: GeocodingService,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    tenantId: string,
    locationId: string,
    userId?: string,
    initialStatus: OrderStatus = OrderStatus.PendingConfirmation,
  ): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = queryRunner.manager.create(Order, {
        ...createOrderDto,
        tenantId,
        locationId,
        status: initialStatus,
        items: [],
      });
      const ingredientsToDeduct: { ingredientId: string, quantity: number }[] = [];
      let totalAmount = 0;
      let totalWeightKg = 0;
      let totalVolumeM3 = 0;

      // Calculate totals first, regardless of status
      for (const itemDto of createOrderDto.items) {
        const product = await queryRunner.manager.findOneBy(Product, { id: itemDto.productId, locationId });
        if (!product) throw new NotFoundException(`Producto con ID "${itemDto.productId}" no encontrado.`);
        const orderItem = queryRunner.manager.create(OrderItem, { product, quantity: itemDto.quantity, unitPrice: product.price, notes: itemDto.notes });
        order.items.push(orderItem);
        totalAmount += product.price * itemDto.quantity;
        totalWeightKg += (Number(product.weightKg) || 0) * itemDto.quantity;
        totalVolumeM3 += (Number(product.volumeM3) || 0) * itemDto.quantity;
      }

      // Only deduct inventory if the order is confirmed from the start
      if (initialStatus === OrderStatus.Confirmed || initialStatus === OrderStatus.PendingConfirmation) {
        for (const itemDto of createOrderDto.items) {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: itemDto.productId, locationId },
            relations: ['ingredients'],
          });
          if (!product) continue; // Already validated

          if (product.ingredients && product.ingredients.length > 0) {
            for (const recipeItem of product.ingredients) {
              const stockToDeduct = recipeItem.quantityRequired * itemDto.quantity;
              await this.inventoryMovementsService.logMovement(
                {
                  ingredientId: recipeItem.ingredientId,
                  userId,
                  orderId: 'temp', // Placeholder, will be updated later
                  type: InventoryMovementType.Sale,
                  quantityChange: -stockToDeduct,
                  reason: `Venta producto: ${product.name}`,
                },
                queryRunner.manager,
              );
            }
          }
        }
      }

      // TODO: Add deliveryFee to CreateOrderDto and uncomment this line
      order.totalAmount = totalAmount; // + (Number(createOrderDto.deliveryFee) || 0);
      order.totalWeightKg = totalWeightKg;
      order.totalVolumeM3 = totalVolumeM3;

      // Geocodificación automática si es un pedido de delivery
      // Asignamos una estimación preliminar (ej. 45 minutos)
      const preliminaryEstimate = new Date();
      preliminaryEstimate.setMinutes(preliminaryEstimate.getMinutes() + 45);
      order.estimatedDeliveryAt = preliminaryEstimate;

      if (order.orderType === 'delivery' && order.deliveryAddress) {
        const coords = await this.geocodingService.geocode(order.deliveryAddress, tenantId);
        if (coords) {
          order.latitude = coords.lat;
          order.longitude = coords.lng;

          // Validar si el pedido está dentro del área de entrega
          const location = await this.locationRepository.findOne({
            where: { id: locationId },
          });

          // TODO: Add deliveryArea (type: Polygon) to the Location entity
          // @ts-ignore
          if (location && location.deliveryArea) {
            const isWithinArea = await this.isPointInDeliveryArea(
              coords.lat,
              coords.lng,
              location.id,
            );

            if (!isWithinArea) {
              const outsideAreaNote = '¡ATENCIÓN! Pedido fuera del área de entrega.';
              order.notes = order.notes
                ? `${outsideAreaNote}\n${order.notes}`
                : outsideAreaNote;
              this.logger.warn(
                `Pedido para ${order.deliveryAddress} está fuera del área de entrega definida para la sucursal ${locationId}.`,
              );
            }
          }
        }
      }

      const savedOrder = await queryRunner.manager.save(order);

      if (initialStatus === OrderStatus.Confirmed || initialStatus === OrderStatus.PendingConfirmation) {
        // Now update movements with the real orderId for this transaction
        await queryRunner.manager.update(InventoryMovement, { orderId: 'temp', userId }, { orderId: savedOrder.id });
      }

      await queryRunner.commitTransaction();

      // Only notify kitchen and check stock if the order is confirmed
      if (initialStatus === OrderStatus.Confirmed || initialStatus === OrderStatus.PendingConfirmation) {
        // Notificar a la cocina en tiempo real
        this.notificationsGateway.sendNewOrderToKitchen(tenantId, savedOrder);

        // After transaction, check for low stock and create notifications
        const checkedIngredientIds = new Set<string>();
        for (const item of savedOrder.items) {
          for (const recipeItem of item.product.ingredients) {
            if (!recipeItem.ingredient || checkedIngredientIds.has(recipeItem.ingredientId)) continue;
            checkedIngredientIds.add(recipeItem.ingredientId);

            const ingredient = await this.ingredientRepository.findOneBy({ id: recipeItem.ingredientId });
            if (ingredient && ingredient.stockQuantity <= ingredient.lowStockThreshold) {
              this.notificationsService.createLowStockNotification(ingredient, tenantId).catch(console.error);
            }
          }
        }
      }
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async confirmOrderPayment(orderId: string, paymentGatewayId: string): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
        relations: ['items', 'items.product', 'items.product.ingredients'],
      });

      if (!order) {
        throw new NotFoundException(`Pedido con ID ${orderId} no encontrado para confirmar pago.`);
      }

      if (order.status !== OrderStatus.PendingPayment) {
        this.logger.warn(`Intento de confirmar pago para un pedido que no está en estado pendiente. ID: ${orderId}, Estado actual: ${order.status}`);
        await queryRunner.rollbackTransaction();
        return order;
      }

      order.paymentStatus = PaymentStatus.Paid;
      order.status = OrderStatus.Confirmed;
      order.paymentGatewayId = paymentGatewayId;

      // TODO: Implement recordSale method in InventoryMovementsService
      // @ts-ignore
      await this.inventoryMovementsService.recordSale(order, queryRunner.manager);

      const savedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      this.notificationsGateway.sendNewOrderToKitchen(order.tenantId, savedOrder);

      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll(tenantId: string, locationId?: string): Promise<Order[]> {
    const where: FindOptionsWhere<Order> = { tenantId };
    if (locationId) {
      where.locationId = locationId;
    }
    return this.orderRepository.find({
      where,
      relations: ['items', 'items.product', 'customer', 'assignedDriver'],
      order: { createdAt: 'DESC' },
    });
  }

  findByStatus(statuses: OrderStatus[], tenantId: string, locationId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { tenantId, locationId, status: In(statuses) },
      relations: ['items', 'items.product', 'customer'],
      order: { createdAt: 'ASC' },
    });
  }

  findOrdersBetween(tenantId: string, locationId: string, startDate: Date, endDate: Date, statuses: OrderStatus[]): Promise<Order[]> {
    return this.orderRepository.find({
      where: {
        tenantId,
        locationId,
        status: In(statuses),
        createdAt: Between(startDate, endDate),
      },
    });
  }

  async getOrderCountsByStatus(options: { tenantId?: string; locationId?: string }, forDate: Date = new Date()) {
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
    } else if (tenantId) {
      // This query is for a TenantAdmin who wants to see all their locations.
      // We need to ensure the order belongs to a location that belongs to the tenant.
      // A subquery or a join is needed. A join is simpler here.
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

  async getDriverPerformanceReport(tenantId: string, locationId: string, startDate?: string, endDate?: string) {
    const qb = this.orderRepository.createQueryBuilder('order')
      .select('order.assignedDriverId', 'driverId')
      .addSelect('driver.fullName', 'driverName')
      .addSelect('COUNT(order.id)', 'totalDeliveries')
      .addSelect('SUM(order.totalAmount::decimal)', 'totalAmountCollected')
      .addSelect(`AVG(EXTRACT(EPOCH FROM (order.deliveredAt - order.assignedAt)) / 60)`, 'averageDeliveryTimeMinutes')
      .innerJoin('order.assignedDriver', 'driver')
      .where('order.tenantId = :tenantId AND order.locationId = :locationId', { tenantId, locationId })
      .andWhere('order.status = :status', { status: OrderStatus.Delivered })
      .andWhere('order.assignedDriverId IS NOT NULL')
      .andWhere("order.deliveryProvider = :deliveryProvider", { deliveryProvider: DeliveryProviderType.InHouse })
      .andWhere('order.deliveredAt IS NOT NULL')
      .andWhere('order.assignedAt IS NOT NULL');

    if (startDate) {
      qb.andWhere('order.deliveredAt >= :startDate', { startDate });
    }
    if (endDate) {
      const toDate = new Date(endDate);
      toDate.setDate(toDate.getDate() + 1); // Para incluir el día completo
      qb.andWhere('order.deliveredAt < :toDate', { toDate: toDate.toISOString().split('T')[0] });
    }

    qb.groupBy('order.assignedDriverId, driver.fullName')
      .orderBy('"totalDeliveries"', 'DESC');

    const rawReport = await qb.getRawMany();

    // Parseamos los resultados crudos a números para un formato consistente
    return rawReport.map(row => ({
      driverId: row.driverId,
      driverName: row.driverName,
      totalDeliveries: parseInt(row.totalDeliveries, 10),
      totalAmountCollected: parseFloat(row.totalAmountCollected),
      averageDeliveryTimeMinutes: row.averageDeliveryTimeMinutes ? parseFloat(row.averageDeliveryTimeMinutes).toFixed(2) : null,
    }));
  }

  async getDriverSettlementData(tenantId: string, locationId: string, startDate: Date, endDate: Date) {
    const orders = await this.orderRepository.find({
      where: {
        tenantId,
        locationId,
        status: OrderStatus.Delivered,
        deliveredAt: Between(startDate, endDate),
        assignedDriverId: Not(IsNull()),
        deliveryProvider: DeliveryProviderType.InHouse,
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

    const reportByDriver = new Map<string, {
      driverId: string;
      driverName: string;
      orders: { shortId: string; totalAmount: number; paymentMethod: PaymentMethod; deliveredAt: Date | null }[];
      totalCollected: number;
      cashCollected: number;
    }>();

    for (const order of orders) {
      if (!order.assignedDriver) continue;
      const driverId = order.assignedDriver.id;
      if (!reportByDriver.has(driverId)) {
        reportByDriver.set(driverId, { driverId, driverName: order.assignedDriver.fullName, orders: [], totalCollected: 0, cashCollected: 0 });
      }
      const driverReport = reportByDriver.get(driverId)!;
      driverReport.orders.push({ shortId: order.shortId, totalAmount: Number(order.totalAmount), paymentMethod: order.paymentMethod, deliveredAt: order.deliveredAt });
      driverReport.totalCollected += Number(order.totalAmount);
      if (order.paymentMethod === PaymentMethod.Cash) {
        driverReport.cashCollected += Number(order.totalAmount);
      }
    }
    return Array.from(reportByDriver.values());
  }

  async findOne(id: string, tenantId: string, locationId?: string): Promise<Order> {
    const where: FindOptionsWhere<Order> = { id, tenantId };
    if (locationId) {
      where.locationId = locationId;
    }
    const order = await this.orderRepository.findOne({ where, relations: ['items', 'items.product', 'customer', 'assignedDriver'] });
    if (!order) {
      throw new NotFoundException(`Pedido con ID "${id}" no encontrado o no pertenece a tu sucursal.`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto, tenantId: string, locationId?: string): Promise<Order> {
    const where: FindOptionsWhere<Order> = { id, tenantId };
    if (locationId) {
      where.locationId = locationId;
    }
    const existingOrder = await this.orderRepository.findOneBy(where);
    if (!existingOrder) {
      throw new NotFoundException(`Pedido con ID "${id}" no encontrado o no pertenece a tu sucursal.`);
    }
    const order = await this.orderRepository.preload({ id, ...updateOrderDto } as any);
    if (!order) {
      throw new NotFoundException(`Pedido con ID "${id}" no encontrado.`);
    }
    return this.orderRepository.save(order);
  }

  async updateStatus(id: string, status: OrderStatus, tenantId: string, locationId?: string): Promise<Order> {
    const order = await this.findOne(id, tenantId, locationId);
    const previousStatus = order.status;
    order.status = status;
    const updatedOrder = await this.orderRepository.save(order);

    if (status === OrderStatus.ReadyForDelivery) {
      this.notificationsGateway.sendOrderReadyNotification(tenantId, updatedOrder);
    }

    // Notificación genérica para el dashboard
    this.notificationsGateway.sendOrderStatusUpdate(tenantId, {
      order: updatedOrder,
      previousStatus: previousStatus,
      newStatus: status,
    });

    return updatedOrder;
  }

  async updatePriority(id: string, isPriority: boolean, tenantId: string, locationId?: string): Promise<Order> {
    const order = await this.findOne(id, tenantId, locationId);
    order.isPriority = isPriority;
    const updatedOrder = await this.orderRepository.save(order);

    // Notificar a los clientes (KDS, Despacho) sobre el cambio
    this.notificationsGateway.sendOrderPriorityUpdate(tenantId, updatedOrder);

    return updatedOrder;
  }

  async assignDriver(orderId: string, driverId: string, tenantId: string, locationId: string): Promise<Order> {
    const order = await this.findOne(orderId, tenantId, locationId);

    if (order.deliveryProvider === DeliveryProviderType.External) {
      throw new BadRequestException('No se puede asignar un repartidor interno a un pedido de entrega externa.');
    }

    if (order.status !== OrderStatus.ReadyForDelivery ) {
      throw new BadRequestException('Solo se pueden asignar repartidores a pedidos que están listos para entrega.');
    }

    const driver = await this.userRepository.findOne({
      where: { id: driverId, locationId, role: { name: RoleEnum.Delivery } },
    });

    if (!driver) {
      throw new NotFoundException(`Repartidor con ID "${driverId}" no encontrado o no tiene el rol correcto.`);
    }

    order.assignedDriverId = driver.id;
    order.status = OrderStatus.InDelivery;
    order.assignedAt = new Date(); // <-- ¡Aquí guardamos el momento de la asignación!

    const updatedOrder = await this.orderRepository.save(order);

    // Notificar al repartidor en tiempo real
    this.notificationsGateway.sendNewDeliveryToDriver(driver.id, updatedOrder);

    // Notificar a la pantalla de despacho que el pedido ya no está disponible
    this.notificationsGateway.sendOrderAssigned(tenantId, updatedOrder);

    return updatedOrder;
  }

  async setPreparationTime(
    id: string,
    tenantId: string,
    locationId: string,
    setPreparationTimeDto: SetPreparationTimeDto,
  ): Promise<Order> {
    const order = await this.findOne(id, tenantId, locationId);

    if (order.status !== OrderStatus.Confirmed) {
      throw new BadRequestException(
        'Solo se puede asignar tiempo de preparación a pedidos confirmados.',
      );
    }

    order.preparationTimeMinutes = setPreparationTimeDto.preparationTimeMinutes;
    order.status = OrderStatus.InPreparation;

    const now = new Date();
    order.estimatedDeliveryAt = new Date(
      now.getTime() + order.preparationTimeMinutes * 60000,
    );

    return this.orderRepository.save(order);
  }

  async updateCoordinates(orderId: string, latitude: number, longitude: number, tenantId: string, locationId?: string): Promise<Order> {
    const order = await this.findOne(orderId, tenantId, locationId);
    order.latitude = latitude;
    order.longitude = longitude;
    const updatedOrder = await this.orderRepository.save(order);

    // Si el pedido tiene un repartidor asignado, le enviamos la actualización.
    if (updatedOrder.assignedDriverId) {
      this.notificationsGateway.sendLocationUpdateToDriver(
        updatedOrder.assignedDriverId,
        updatedOrder,
      );
    }

    return updatedOrder;
  }

  private async isPointInDeliveryArea(
    latitude: number,
    longitude: number,
    locationId: string,
  ): Promise<boolean> {
    if (!latitude || !longitude) {
      return false;
    }

    // Usamos una consulta SQL nativa para aprovechar PostGIS
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
        longitude, // PostGIS espera (long, lat)
        latitude,
        locationId,
      ]);

      if (result && result.length > 0) {
        return result[0].isWithin;
      }
      return false;
    } catch (error) {
      this.logger.error('Error al verificar el área de entrega con PostGIS', error);
      return false;
    }
  }

  async getSalesReport(tenantId: string, locationId: string, startDate?: string, endDate?: string) {
    const qb = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .where('order.tenantId = :tenantId AND order.locationId = :locationId', { tenantId, locationId })
      .andWhere('order.status != :cancelledStatus', { cancelledStatus: OrderStatus.Cancelled });

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

    const productsBreakdownMap = new Map<string, { productName: string; quantitySold: number; totalRevenue: number }>();

    for (const order of orders) {
      for (const item of order.items) {
        if (!item.product) continue;
        
        const revenue = item.quantity * Number(item.unitPrice);
        const existing = productsBreakdownMap.get(item.productId);

        if (existing) {
          existing.quantitySold += item.quantity;
          existing.totalRevenue += revenue;
        } else {
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

  async getIngredientConsumptionReport(tenantId: string, locationId: string, startDate?: string, endDate?: string) {
    const qb = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoinAndSelect('product.ingredients', 'productIngredient')
      .leftJoinAndSelect('productIngredient.ingredient', 'ingredient')
      .where('order.tenantId = :tenantId AND order.locationId = :locationId', { tenantId, locationId })
      // Exclude cancelled orders from consumption report
      .andWhere('order.status != :cancelledStatus', { cancelledStatus: OrderStatus.Cancelled });

    if (startDate) {
      qb.andWhere('order.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      // Add 1 day to endDate to include the whole day
      const toDate = new Date(endDate);
      toDate.setDate(toDate.getDate() + 1);
      qb.andWhere('order.createdAt < :toDate', { toDate });
    }

    const orders = await qb.getMany();

    const consumption = new Map<string, { ingredientName: string; unit: string; totalConsumed: number }>();

    for (const order of orders) {
      for (const item of order.items) {
        if (!item.product || !item.product.ingredients) continue;
        for (const recipeItem of item.product.ingredients) {
          if (!recipeItem.ingredient) continue;
          
          const consumed = item.quantity * Number(recipeItem.quantityRequired);
          const existing = consumption.get(recipeItem.ingredient.id);

          if (existing) {
            existing.totalConsumed += consumed;
          } else {
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

  async getProfitabilityReport(tenantId: string, locationId: string) {
    const products = await this.productRepository.find({
      where: { recipeIsSet: true, tenantId, locationId },
      relations: ['ingredients', 'ingredients.ingredient'],
    });

    const report = products.map(product => {
      const ingredientsCost = product.ingredients.reduce((total, recipeItem) => {
        // Ensure ingredient and its cost are defined to prevent errors
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

    return report.sort((a, b) => a.profit - b.profit); // Sort by lowest profit first
  }
}