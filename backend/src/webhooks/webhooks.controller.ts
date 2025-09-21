import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhookSignatureGuard } from './guards/webhook-signature.guard';
import { InvoiceWebhookPayload } from './dto/invoice-webhook.dto';
import { Request } from 'express';

interface RequestWithTenant extends Request {
  tenantId: string;
}

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('invoicing')
  @UseGuards(WebhookSignatureGuard)
  @HttpCode(HttpStatus.OK)
  async handleInvoicingWebhook(
    @Body() payload: InvoiceWebhookPayload,
    @Req() req: RequestWithTenant,
  ) {
    const tenantId = req.tenantId;
    
    this.webhooksService.processInvoicingWebhook(tenantId, payload).catch(error => {
      console.error(`Error procesando webhook de facturación para tenant ${tenantId}:`, error);
    });

    return { received: true };
  }
}