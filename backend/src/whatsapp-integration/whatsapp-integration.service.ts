import { Injectable, BadRequestException } from '@nestjs/common';
import { CustomersService } from '../customers/customers.service';
import { OrdersService } from '../orders/orders.service';
import { CreateWhatsappOrderDto } from './dto/create-whatsapp-order.dto';
import { Tenant } from '../tenants/entities/tenant.entity';
import { PaymentsService } from '../payments/payments.service';
import { PaymentMethod } from '../orders/enums/order-types.enum';
import { OrderStatus } from '../orders/enums/order-status.enum';

@Injectable()
export class WhatsappIntegrationService {
  constructor(
    private readonly customersService: CustomersService,
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async processIncomingOrder(tenant: Tenant, orderDto: CreateWhatsappOrderDto) {
    if (!tenant.configuration.enabledPaymentMethods.includes(orderDto.paymentMethod)) {
      throw new BadRequestException(`El método de pago '${orderDto.paymentMethod}' no está habilitado para este negocio.`);
    }

    // 1. Buscar o crear al cliente
    const customer = await this.customersService.findOrCreateByPhone(
      {
        phoneNumber: orderDto.customerPhone,
        fullName: orderDto.customerName,
      },
      tenant.id,
    );

    // 2. Crear el pedido con un estado inicial
    const isOnlinePayment = orderDto.paymentMethod === PaymentMethod.MercadoPago;

    const createdOrder = await this.ordersService.create(
      {
        locationId: orderDto.locationId,
        customerId: customer.id,
        orderType: orderDto.orderType,
        paymentMethod: orderDto.paymentMethod,
        deliveryAddress: orderDto.deliveryAddress,
        items: orderDto.items,
      },
      tenant.id,
      orderDto.locationId,
      undefined,
      isOnlinePayment ? OrderStatus.PendingPayment : OrderStatus.Confirmed,
    );

    // 3. Procesar el pago si es necesario
    if (isOnlinePayment) {
      const paymentInfo = await this.paymentsService.createMercadoPagoPreference(tenant, createdOrder);

      // Actualizar la orden con la información del pago
      await this.ordersService.update(createdOrder.id, {
        paymentGatewayId: paymentInfo.preferenceId,
        paymentLink: paymentInfo.init_point,
      }, tenant.id, orderDto.locationId);

      return {
        message: 'Pedido pre-registrado. Por favor, completa el pago para confirmar.',
        paymentLink: paymentInfo.init_point,
        orderId: createdOrder.shortId,
      };
    } else {
      return {
        message: 'Pedido confirmado con éxito.',
        orderId: createdOrder.shortId,
        totalAmount: createdOrder.totalAmount,
        estimatedReadyAt: createdOrder.estimatedDeliveryAt,
      };
    }
  }
}