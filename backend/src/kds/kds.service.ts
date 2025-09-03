import { Injectable } from '@nestjs/common';
import { OrderStatus } from '../enums/order-status.enum';
import { OrdersService } from '../orders/orders.service';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class KdsService {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  async getActiveOrdersForZone(tenantId: string, locationId: string, zoneId: string): Promise<Order[]> {
    const activeStatuses = [
      OrderStatus.Confirmed,
      OrderStatus.InPreparation,
      OrderStatus.ReadyForExternalPickup,
    ];

    const orders = await this.ordersService.findByStatus(activeStatuses, tenantId, locationId);

    // Filtra los items de cada pedido para que solo contengan los de la zona especificada
    const filteredOrders = orders
      .map(order => {
        const relevantItems = order.items.filter(
          item => item.product.preparationZoneId === zoneId,
        );
        return { ...order, items: relevantItems };
      })
      .filter(order => order.items.length > 0); // Solo incluye pedidos que tienen items para esta zona

    return filteredOrders;
  }
}