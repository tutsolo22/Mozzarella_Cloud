import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, Query, ForbiddenException } from '@nestjs/common';
import { FinancialsService } from './financials.service';
import { CreateOverheadCostDto } from './dto/create-overhead-cost.dto';
import { UpdateOverheadCostDto } from './dto/update-overhead-cost.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { User, UserPayload } from '../auth/decorators/user.decorator';

@Controller('financials')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.Admin, RoleEnum.Manager)
export class FinancialsController {
  constructor(private readonly financialsService: FinancialsService) {}

  @Post('overhead-costs')
  create(@Body() createDto: CreateOverheadCostDto, @User() user: UserPayload) {
    if (!user.locationId) {
      throw new ForbiddenException('No tienes una sucursal asignada para registrar costos.');
    }
    return this.financialsService.create(createDto, user.tenantId, user.locationId);
  }

  @Get('overhead-costs')
  findAll(
    @User() user: UserPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('locationId') locationId?: string,
  ) {
    if (user.role === RoleEnum.Admin) {
      // TenantAdmin can see all or filter by a specific location
      return this.financialsService.findAll(user.tenantId, startDate, endDate, locationId);
    }
    // Manager can only see their own location's costs
    if (!user.locationId) {
      throw new ForbiddenException('No tienes una sucursal asignada.');
    }
    if (locationId && locationId !== user.locationId) {
      throw new ForbiddenException('No tienes permiso para ver los costos de otra sucursal.');
    }
    return this.financialsService.findAll(user.tenantId, startDate, endDate, user.locationId);
  }

  @Patch('overhead-costs/:id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateOverheadCostDto, @User() user: UserPayload) {
    const locationId = user.role === RoleEnum.Manager ? user.locationId : undefined;
    if (user.role === RoleEnum.Manager && !locationId) {
      throw new ForbiddenException('No tienes una sucursal asignada.');
    }
    return this.financialsService.update(id, updateDto, user.tenantId, locationId);
  }

  @Delete('overhead-costs/:id')
  remove(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    const locationId = user.role === RoleEnum.Manager ? user.locationId : undefined;
    if (user.role === RoleEnum.Manager && !locationId) {
      throw new ForbiddenException('No tienes una sucursal asignada.');
    }
    return this.financialsService.remove(id, user.tenantId, locationId);
  }
}