import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
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
@Roles(RoleEnum.Admin, RoleEnum.Manager)
export class PreparationZonesController {
  constructor(private readonly zonesService: PreparationZonesService) {}

  @Post()
  create(@Body() createDto: CreatePreparationZoneDto, @User() user: UserPayload) {
    if (!user.locationId) throw new ForbiddenException('No tienes una sucursal asignada.');
    return this.zonesService.create(createDto, user.tenantId, user.locationId);
  }

  @Get()
  findAll(@User() user: UserPayload) {
    if (!user.locationId) throw new ForbiddenException('No tienes una sucursal asignada.');
    return this.zonesService.findAll(user.tenantId, user.locationId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    if (!user.locationId) throw new ForbiddenException('No tienes una sucursal asignada.');
    return this.zonesService.findOne(id, user.tenantId, user.locationId);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdatePreparationZoneDto, @User() user: UserPayload) {
    if (!user.locationId) throw new ForbiddenException('No tienes una sucursal asignada.');
    return this.zonesService.update(id, updateDto, user.tenantId, user.locationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    if (!user.locationId) throw new ForbiddenException('No tienes una sucursal asignada.');
    return this.zonesService.remove(id, user.tenantId, user.locationId);
  }
}