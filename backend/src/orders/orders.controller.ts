import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseUUIDPipe, Query, ForbiddenException, HttpCode, HttpStatus } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User, UserPayload } from '../auth/decorators/user.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from '../enums/order-status.enum';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  create(@Body() createOrderDto: CreateOrderDto, @User() user: UserPayload) {
    if (!user.locationId) {
      throw new ForbiddenException('No tienes una sucursal asignada para crear pedidos.');
    }
    return this.ordersService.create(createOrderDto, user.tenantId, user.locationId);
  }

  @Get()
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Kitchen)
  findAll(@User() user: UserPayload, @Query('locationId') locationId?: string) {
    if (user.role === RoleEnum.Admin) {
      // TenantAdmin can see all orders for their tenant, or filter by a specific location
      return this.ordersService.findAll(user.tenantId, locationId);
    }
    // Other roles (Manager, Kitchen) can only see their own location's orders
    if (!user.locationId) {
      throw new ForbiddenException('No tienes una sucursal asignada.');
    }
    return this.ordersService.findAll(user.tenantId, user.locationId);
  }

  @Get(':id')
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Kitchen)
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    const locationId = user.role !== RoleEnum.Admin ? user.locationId : undefined;
    return this.ordersService.findOne(id, user.tenantId, locationId);
  }

  @Patch(':id')
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateOrderDto: UpdateOrderDto, @User() user: UserPayload) {
    const locationId = user.role === RoleEnum.Manager ? user.locationId : undefined;
    return this.ordersService.update(id, updateOrderDto, user.tenantId, locationId);
  }

  @Patch(':id/status')
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Kitchen)
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() { status }: { status: OrderStatus },
    @User() user: UserPayload,
  ) {
    const locationId = user.role !== RoleEnum.Admin ? user.locationId : undefined;
    if (user.role !== RoleEnum.Admin && !locationId) {
      throw new ForbiddenException('No tienes una sucursal asignada para actualizar pedidos.');
    }
    return this.ordersService.updateStatus(id, status, user.tenantId, locationId);
  }
}