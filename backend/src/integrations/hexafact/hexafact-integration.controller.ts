import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiSecurity, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { HexaFactWebhookGuard } from './guards/hexafact-webhook.guard';
import { HexaFactWebhookDto } from './dto/hexafact-webhook.dto';
import { TenantsService } from '../../tenants/tenants.service';

@ApiTags('Integrations - HexaFact')
@Controller('integrations/hexafact')
export class HexaFactIntegrationController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Public()
  @UseGuards(HexaFactWebhookGuard)
  @Post('webhook/tenant-ready')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Webhook para recibir la URL de facturación cuando un tenant está listo en HexaFact.' })
  @ApiSecurity('x-webhook-api-key')
  async handleTenantReadyWebhook(@Body() webhookDto: HexaFactWebhookDto): Promise<void> {
    const { tenantId, invoicingAppUrl } = webhookDto;
    await this.tenantsService.setInvoicingUrl(tenantId, invoicingAppUrl);
  }
}