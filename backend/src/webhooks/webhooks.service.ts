import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { InvoiceWebhookPayload } from './dto/invoice-webhook.dto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Processes an incoming webhook from the external invoicing service.
   * @param tenantId The ID of the tenant, validated by the guard.
   * @param payload The webhook data.
   */
  async processInvoicingWebhook(tenantId: string, payload: InvoiceWebhookPayload): Promise<void> {
    this.logger.log(`Procesando webhook de facturación para tenant ${tenantId}, orden externa ${payload.externalOrderId}`);

    try {
      // The findOne method in OrdersService should handle the tenant scoping.
      // We pass `undefined` for locationId to search across all locations for the tenant.
      const order = await this.ordersService.findOne(payload.internalOrderId, tenantId, undefined);

      if (payload.status === 'invoiced') {
        await this.ordersService.update(order.id, { isBilled: true, invoiceUrl: payload.invoiceUrl }, tenantId, order.locationId);
        this.logger.log(`Orden ${order.shortId} (ID: ${order.id}) marcada como facturada. URL: ${payload.invoiceUrl}`);
      } else {
        this.logger.log(`Webhook de facturación recibido con estado '${payload.status}' para la orden ${order.shortId}. No se requiere acción.`);
      }
    } catch (error) {
      // Fail silently to prevent leaking information about existing orders to a potential attacker.
      this.logger.warn(`Webhook recibido para una orden no encontrada o no perteneciente al tenant. OrderID: ${payload.internalOrderId}, TenantID: ${tenantId}`);
    }
  }
}