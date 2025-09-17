import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';

@Injectable()
export class KdsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findOrders(
    tenantId: string,
    locationId: string,
    zoneId?: string,
  ): Promise<Order[]> {
    const statuses = [
      OrderStatus.PendingConfirmation,
      OrderStatus.InPreparation,
      OrderStatus.ReadyForExternalPickup,
    ];

    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoinAndSelect('product.preparationZone', 'preparationZone')
      .leftJoinAndSelect('order.customer', 'customer')
      .where('order.tenantId = :tenantId', { tenantId })
      .andWhere('order.locationId = :locationId', { locationId })
      .andWhere('order.status IN (:...statuses)', { statuses })
      .orderBy('order.createdAt', 'ASC');

    if (zoneId) {
      query.andWhere('product.preparationZoneId = :zoneId', { zoneId });
    }

    return query.getMany();
  }
}