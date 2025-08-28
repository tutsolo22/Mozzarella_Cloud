import { Controller, Get, UseGuards, Patch, Param, Body, ParseUUIDPipe, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { SuperAdminService } from './super-admin.service';
import { UpdateTenantStatusDto } from './dto/update-tenant-status.dto';
import { CreateLicenseDto } from './dto/create-license.dto';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('tenants')
  @Roles(RoleEnum.SuperAdmin)
  findAllTenants() {
    return this.superAdminService.findAllTenants();
  }

  @Get('dashboard-stats')
  @Roles(RoleEnum.SuperAdmin)
  getDashboardStats() {
    return this.superAdminService.getDashboardStats();
  }

  @Patch('tenants/:id/status')
  @Roles(RoleEnum.SuperAdmin)
  updateTenantStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTenantStatusDto: UpdateTenantStatusDto,
  ) {
    return this.superAdminService.updateTenantStatus(
      id,
      updateTenantStatusDto.status,
    );
  }

  @Post('tenants/:id/license')
  @Roles(RoleEnum.SuperAdmin)
  createLicense(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createLicenseDto: CreateLicenseDto,
  ) {
    return this.superAdminService.createLicenseForTenant(id, createLicenseDto);
  }

  @Post('tenants/:id/license/revoke')
  @Roles(RoleEnum.SuperAdmin)
  @HttpCode(HttpStatus.OK)
  revokeLicense(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.superAdminService.revokeLicense(id);
  }
}