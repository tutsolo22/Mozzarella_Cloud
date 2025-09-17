import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, ForbiddenException, HttpCode } from '@nestjs/common';
import { PreparationZonesService } from './preparation-zones.service';
import { CreatePreparationZoneDto } from './dto/create-preparation-zone.dto';
import { UpdatePreparationZoneDto } from './dto/update-preparation-zone.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { User, UserPayload } from '../auth/decorators/user.decorator';

@Controller('preparation-zones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PreparationZonesController {
  constructor(private readonly zonesService: PreparationZonesService) {}

  private ensureLocationSelected(user: UserPayload) {
    if (!user.locationId) {
      throw new ForbiddenException('Debes tener una sucursal seleccionada para realizar esta acción.');
    }
  }

  @Post()
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  create(@Body() createDto: CreatePreparationZoneDto, @User() user: UserPayload) {
    this.ensureLocationSelected(user);
    return this.zonesService.create(createDto, user.tenantId, user.locationId);
  }

  @Get()
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Kitchen)
  findAll(@User() user: UserPayload) {
    this.ensureLocationSelected(user);
    return this.zonesService.findAll(user.tenantId, user.locationId);
  }

  @Patch(':id')
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdatePreparationZoneDto, @User() user: UserPayload) {
    this.ensureLocationSelected(user);
    return this.zonesService.update(id, updateDto, user.tenantId, user.locationId);
  }

  @Delete(':id')
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    this.ensureLocationSelected(user);
    await this.zonesService.remove(id, user.tenantId, user.locationId);
  }
}