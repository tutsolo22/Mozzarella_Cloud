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
  Query,
  HttpCode,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { User, UserPayload } from '../auth/decorators/user.decorator';

@Controller('locations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.Admin) // Only Admins can manage locations
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  create(@Body() createLocationDto: CreateLocationDto, @User() user: UserPayload) {
    return this.locationsService.create(createLocationDto, user.tenantId);
  }

  @Get()
  findAll(@User() user: UserPayload, @Query('includeInactive') includeInactive?: string) {
    const fetchInactive = includeInactive === 'true';
    return this.locationsService.findAll(user.tenantId, fetchInactive);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @User() user: UserPayload,
  ) {
    return this.locationsService.update(id, user.tenantId, updateLocationDto);
  }

  @Delete(':id')
  @HttpCode(204)
  disable(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    return this.locationsService.disable(id, user.tenantId);
  }

  @Patch(':id/enable')
  enable(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    return this.locationsService.enable(id, user.tenantId);
  }
}