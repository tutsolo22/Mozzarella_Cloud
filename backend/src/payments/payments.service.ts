import { Injectable, InternalServerErrorException, NotFoundException, Inject, forwardRef, Logger } from '@nestjs/common';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { TenantsService } from '../tenants/tenants.service';
import { Order } from '../orders/entities/order.entity';
import { OrdersService } from '../orders/orders.service';
import { Tenant } from '../tenants/entities/tenant.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly tenantsService: TenantsService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  async createMercadoPagoPreference(tenant: Tenant, order: Order) {
    if (!tenant.configuration.mercadoPagoAccessToken) {
      throw new InternalServerErrorException('Mercado Pago no está configurado para este negocio.');
    }
    if (!tenant.whatsappApiKey) {
      throw new InternalServerErrorException('La clave de API para webhooks no está configurada.');
    }

    const client = new MercadoPagoConfig({
      accessToken: tenant.configuration.mercadoPagoAccessToken,
    });
    const preference = new Preference(client);

    const notification_url = `${process.env.BACKEND_URL}/payments/mercado-pago/webhook?apiKey=${tenant.whatsappApiKey}`;
    this.logger.log(`Generated Notification URL: ${notification_url}`);

    try {
      const result = await preference.create({
        body: {
          items: order.items.map(item => ({
            id: item.product.id,
            title: item.product.name,
            description: item.notes,
            quantity: item.quantity,
            unit_price: Number(item.unitPrice),
            currency_id: 'MXN',
          })),
          back_urls: {
            success: `${process.env.FRONTEND_URL}/order/${order.shortId}/success`,
            failure: `${process.env.FRONTEND_URL}/order/${order.shortId}/failure`,
          },
          notification_url,
          external_reference: order.id,
        },
      });

      return { preferenceId: result.id, init_point: result.init_point };
    } catch (error) {
      this.logger.error('Error creating Mercado Pago preference:', error.cause ?? error);
      throw new InternalServerErrorException('No se pudo crear el link de pago.');
    }
  }

  async handleWebhook(paymentId: string, tenantId: string) {
    const tenant = await this.tenantsService.findOne(tenantId);
    const client = new MercadoPagoConfig({ accessToken: tenant.configuration.mercadoPagoAccessToken });
    const payment = new Payment(client);

    const paymentInfo = await payment.get({ id: paymentId });
    this.logger.log(`Verifying payment for order ID: ${paymentInfo.external_reference}`);

    if (paymentInfo.status === 'approved') {
      const orderId = paymentInfo.external_reference;
      await this.ordersService.confirmOrderPayment(orderId, paymentId);
      this.logger.log(`Payment for order ${orderId} approved and confirmed.`);
    } else {
      this.logger.warn(`Payment ${paymentId} for order ${paymentInfo.external_reference} is not approved. Status: ${paymentInfo.status}`);
    }
  }
}