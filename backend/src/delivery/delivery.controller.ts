import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { User, UserPayload } from '../auth/decorators/user.decorator';
import { RouteOptimizationService } from './services/route-optimization.service';
import { OptimizeRoutesDto } from './dto/optimize-routes.dto';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { OrderStatus } from '../orders/enums/order-status.enum';

@Controller('delivery')
export class DeliveryController {
  constructor(
    private readonly routeOptimizationService: RouteOptimizationService,
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly tenantsService: TenantsService,
  ) {}

  @Post('optimize-routes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  async optimizeRoutes(
    @Body() optimizeRoutesDto: OptimizeRoutesDto,
    @User() user: UserPayload,
  ) {
    const { tenantId } = user;
    const { maxOrdersPerDriver } = optimizeRoutesDto;

    const [pendingOrders, availableDrivers, tenantConfig] = await Promise.all([
      this.ordersService.findByStatus([OrderStatus.ReadyForDelivery], tenantId),
      this.usersService.findByRoles([RoleEnum.Delivery], tenantId),
      this.tenantsService.getConfiguration(tenantId),
    ]);

    if (!tenantConfig?.restaurantLatitude || !tenantConfig?.restaurantLongitude) {
      throw new BadRequestException('La ubicación del restaurante no está configurada.');
    }

    const restaurantLocation = { lat: tenantConfig.restaurantLatitude, lng: tenantConfig.restaurantLongitude };

    return this.routeOptimizationService.optimizeRoutes(
      pendingOrders, availableDrivers, { maxOrdersPerDriver }, restaurantLocation, tenantConfig.directionsApiKey,
    );
  }
}