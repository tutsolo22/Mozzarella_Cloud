import { Injectable } from '@nestjs/common';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { OrdersService } from '../orders/orders.service';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class KdsService {
  constructor(private readonly ordersService: OrdersService) {}

  async getActiveOrdersForZone(
    tenantId: string,
    locationId: string,
    zoneId: string,
  ): Promise<Order[]> {
    const activeStatuses = [
      OrderStatus.Confirmed,
      OrderStatus.InPreparation,
      OrderStatus.ReadyForExternalPickup,
    ];

    const orders = await this.ordersService.findByStatus(
      activeStatuses,
      tenantId,
      locationId,
    );

    // Modificamos la instancia del pedido directamente para no perder el prototipo de la clase
    return orders
      .map((order) => {
        order.items = order.items.filter(
          (item) => item.product?.preparationZoneId === zoneId,
        );
        return order;
      })
      .filter((order) => order.items.length > 0);
  }
}