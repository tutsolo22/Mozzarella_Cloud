import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';
import * as dayjs from 'dayjs';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handlePendingPaymentReminders() {
    this.logger.log('Ejecutando tarea de recordatorios de pago pendiente...');

    // Busca pedidos en 'pending_payment' creados hace más de 10 minutos.
    const tenMinutesAgo = dayjs().subtract(10, 'minutes').toDate();

    const pendingOrders = await this.orderRepository.find({
      where: {
        status: OrderStatus.PendingPayment,
        createdAt: LessThan(tenMinutesAgo),
        // Para evitar spam, se podría añadir un campo `reminderSentAt` a la entidad Order
        // y añadir una condición aquí como `reminderSentAt: IsNull()`.
        // Por ahora, esta es una implementación simple.
      },
      relations: ['customer'], // Carga la información del cliente para la notificación.
    });

    if (pendingOrders.length === 0) {
      this.logger.log('No hay pedidos con pago pendiente que requieran recordatorio.');
      return;
    }

    this.logger.log(`Enviando ${pendingOrders.length} recordatorios...`);

    for (const order of pendingOrders) {
      this.logger.log(`Simulando envío de recordatorio para el pedido ${order.shortId} al cliente con ID ${order.customer?.id}.`);
      // En una aplicación real, aquí se integraría con un servicio de notificaciones (WhatsApp, SMS, etc.)
      // Ejemplo: await this.notificationService.sendWhatsappReminder(order.customer.phoneNumber, order.paymentLink);
    }
  }
}