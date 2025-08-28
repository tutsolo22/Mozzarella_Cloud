import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { ProductIngredient } from '../products/entities/product-ingredient.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './enums/order-status.enum';
import { InventoryMovementsService } from '../inventory-movements/inventory-movements.service';
import { InventoryMovementType } from '../inventory-movements/enums/inventory-movement-type.enum';
import { InventoryMovement } from '../inventory-movements/entities/inventory-movement.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly inventoryMovementsService: InventoryMovementsService,
    private readonly notificationsService: NotificationsService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto, tenantId: string, userId: string): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = queryRunner.manager.create(Order, { tenantId, items: [] });
      const ingredientsToDeduct: { ingredientId: string, quantity: number }[] = [];
      let totalAmount = 0;

      for (const itemDto of createOrderDto.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: itemDto.productId, tenantId },
          relations: ['ingredients'],
        });
        if (!product) {
          throw new NotFoundException(`Producto con ID "${itemDto.productId}" no encontrado.`);
        }

        // Deduct stock for each ingredient in the recipe
        for (const recipeItem of product.ingredients) {
          const stockToDeduct = recipeItem.quantityRequired * itemDto.quantity;
          await queryRunner.manager.decrement(Ingredient, { id: recipeItem.ingredientId, tenantId }, 'stockQuantity', stockToDeduct);          

          // Record the movement
          await this.inventoryMovementsService.recordMovement({
            tenantId,
            ingredientId: recipeItem.ingredientId,
            userId,
            orderId: 'temp', // Placeholder, will be updated later
            type: InventoryMovementType.Sale,
            quantityChange: -stockToDeduct,
            reason: `Venta producto: ${product.name}`,
          }, queryRunner.manager);
        }

        const orderItem = queryRunner.manager.create(OrderItem, {
          product,
          quantity: itemDto.quantity,
          unitPrice: product.price,
          notes: itemDto.notes,
        });
        order.items.push(orderItem);
        totalAmount += product.price * itemDto.quantity;
      }

      order.totalAmount = totalAmount;
      const savedOrder = await queryRunner.manager.save(order);

      // Now update movements with the real orderId for this transaction
      await queryRunner.manager.update(InventoryMovement, { orderId: 'temp', userId }, { orderId: savedOrder.id });

      await queryRunner.commitTransaction();

      // After transaction, check for low stock and create notifications
      // We do this after the transaction to not block the order creation process
      const checkedIngredientIds = new Set<string>();
      for (const item of savedOrder.items) {
        for (const recipeItem of item.product.ingredients) {
          if (checkedIngredientIds.has(recipeItem.ingredientId)) continue;
          checkedIngredientIds.add(recipeItem.ingredientId);

          const ingredient = await this.ingredientRepository.findOneBy({ id: recipeItem.ingredientId, tenantId });
          if (ingredient && ingredient.stockQuantity <= ingredient.lowStockThreshold) {
            this.notificationsService.createLowStockNotification(ingredient, tenantId).catch(console.error);
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

  findAll(tenantId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: OrderStatus, tenantId: string): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id, tenantId });
    if (!order) {
      throw new NotFoundException(`Pedido con ID "${id}" no encontrado.`);
    }
    order.status = status;
    return this.orderRepository.save(order);
  }

  async getSalesReport(tenantId: string, startDate?: string, endDate?: string) {
    const qb = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .where('order.tenantId = :tenantId', { tenantId })
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

  async getIngredientConsumptionReport(tenantId: string, startDate?: string, endDate?: string) {
    const qb = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoinAndSelect('product.ingredients', 'productIngredient')
      .leftJoinAndSelect('productIngredient.ingredient', 'ingredient')
      .where('order.tenantId = :tenantId', { tenantId })
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

  async getProfitabilityReport(tenantId: string) {
    const products = await this.productRepository.find({
      where: { tenantId, recipeIsSet: true },
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