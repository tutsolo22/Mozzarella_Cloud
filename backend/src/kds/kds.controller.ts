import { Controller, Get, UseGuards, ForbiddenException, Param, ParseUUIDPipe } from '@nestjs/common';
import { KdsService } from './kds.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { User, UserPayload } from '../auth/decorators/user.decorator';

@Controller('kds')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KdsController {
  constructor(private readonly kdsService: KdsService) {}

  @Get('orders/:zoneId')
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Kitchen)
  getActiveOrdersForZone(@User() user: UserPayload, @Param('zoneId', ParseUUIDPipe) zoneId: string) {
    if (!user.locationId) {
      throw new ForbiddenException('No tienes una sucursal asignada para ver el KDS.');
    }
    return this.kdsService.getActiveOrdersForZone(user.tenantId, user.locationId, zoneId);
  }
}