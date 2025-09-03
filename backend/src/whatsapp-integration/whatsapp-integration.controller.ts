import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { WhatsappIntegrationService } from './whatsapp-integration.service';
import { CreateWhatsappOrderDto } from './dto/create-whatsapp-order.dto';
import { ApiKeyGuard } from './guards/api-key.guard';
import { Tenant } from '../tenants/entities/tenant.entity';

@Controller('whatsapp')
export class WhatsappIntegrationController {
  constructor(private readonly integrationService: WhatsappIntegrationService) {}

  /**
   * Endpoint para recibir pedidos desde un chatbot (n8n, Twilio, etc.)
   * Protegido por una clave de API que identifica al tenant.
   */
  @Post('incoming-order')
  @UseGuards(ApiKeyGuard)
  async handleIncomingOrder(
    @Body() createWhatsappOrderDto: CreateWhatsappOrderDto,
    @Req() req: any, // Request object is decorated by the guard
  ) {
    const tenant: Tenant = req.tenant;
    return this.integrationService.processIncomingOrder(tenant, createWhatsappOrderDto);
  }
}