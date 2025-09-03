import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { Promotion } from './entities/promotion.entity';

@Controller('public/promotions')
export class PublicPromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  /**
   * Endpoint público para que un chatbot o cliente externo consulte
   * las promociones activas para una sucursal específica.
   * @param locationId - El UUID de la sucursal.
   * @returns Una lista de promociones activas con sus productos.
   */
  @Get('active/:locationId')
  findActive(@Param('locationId', ParseUUIDPipe) locationId: string): Promise<Promotion[]> {
    return this.promotionsService.findActiveByLocation(locationId);
  }
}