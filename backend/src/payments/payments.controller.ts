import { Controller, Post, Body, Query, Logger, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentApiKeyGuard } from './guards/payment-api-key.guard';
import { Tenant } from '../tenants/entities/tenant.entity';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('mercado-pago/webhook')
  @UseGuards(PaymentApiKeyGuard)
  @HttpCode(HttpStatus.OK) // Siempre devolver 200 OK a Mercado Pago
  async handleMercadoPagoWebhook(@Req() req: any, @Query('type') type: string, @Body() body: any) {
    this.logger.log(`Webhook de Mercado Pago recibido: ${type}`);
    this.logger.debug(`Webhook Body: ${JSON.stringify(body)}`);

    if (type === 'payment') {
      const paymentId = body.data.id; // ID del pago en Mercado Pago
      const tenant: Tenant = req.tenant;
      try {
        await this.paymentsService.handleWebhook(paymentId, tenant.id);
        this.logger.log(`Webhook para el pago ${paymentId} procesado correctamente.`);
      } catch (error) {
        this.logger.error(`Error procesando el webhook para el pago ${paymentId}:`, error);
      }
    }
  }
}