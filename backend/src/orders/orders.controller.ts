import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseUUIDPipe, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { User, UserPayload } from '../auth/decorators/user.decorator';
import { OrderStatus } from './enums/order-status.enum';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  create(@Body() createOrderDto: CreateOrderDto, @User() user: UserPayload) {
    return this.ordersService.create(createOrderDto, user.tenantId, user.userId);
  }

  @Get()
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Kitchen)
  findAll(@User() user: UserPayload) {
    return this.ordersService.findAll(user.tenantId);
  }

  @Get('reports/sales')
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  getSalesReport(
    @User() user: UserPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.ordersService.getSalesReport(user.tenantId, startDate, endDate);
  }

  @Get('reports/ingredient-consumption')
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  getIngredientConsumptionReport(
    @User() user: UserPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.ordersService.getIngredientConsumptionReport(user.tenantId, startDate, endDate);
  }

  @Get('reports/profitability')
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  getProfitabilityReport(@User() user: UserPayload) {
    return this.ordersService.getProfitabilityReport(user.tenantId);
  }

  @Patch(':id/status')
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Kitchen)
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body('status') status: OrderStatus, @User() user: UserPayload) {
    return this.ordersService.updateStatus(id, status, user.tenantId);
  }
}