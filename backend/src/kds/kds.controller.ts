import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { User, UserPayload } from '../auth/decorators/user.decorator';
import { KdsService } from './kds.service';

@Controller('kds')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Kitchen)
export class KdsController {
  constructor(private readonly kdsService: KdsService) {}

  @Get('orders')
  findAll(@User() user: UserPayload) {
    return this.kdsService.findOrders(user.tenantId, user.locationId);
  }

  @Get('orders/zone/:zoneId')
  findByZone(
    @Param('zoneId', ParseUUIDPipe) zoneId: string,
    @User() user: UserPayload,
  ) {
    return this.kdsService.findOrders(user.tenantId, user.locationId, zoneId);
  }
}