import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { CreateTenantDto } from '../tenants/dto/create-tenant.dto';
import { UpdateTenantDto } from '../tenants/dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { TenantStatus } from '../tenants/entities/tenant.entity';

@Controller('super-admin/tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.SuperAdmin)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Post()
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.superAdminService.create(createTenantDto);
  }

  @Get()
  findAll() {
    return this.superAdminService.findAllTenants();
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.superAdminService.updateTenant(id, updateTenantDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body('status') status: TenantStatus) {
    return this.superAdminService.updateTenantStatus(id, status);
  }

  @Post(':id/resend-invitation')
  resendInvitation(@Param('id', ParseUUIDPipe) id: string) {
    return this.superAdminService.resendInvitation(id);
  }

  @Post(':tenantId/create-default-location')
  createDefaultLocationForTenant(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.superAdminService.createDefaultLocationForTenant(tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.superAdminService.deleteTenant(id);
  }
}