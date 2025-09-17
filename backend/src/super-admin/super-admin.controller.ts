import { Controller, Get, Post, Body, UseGuards, Param, Delete, Patch, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { CreateTenantDto } from '../tenants/dto/create-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { GenerateLicenseDto } from '../licenses/dto/generate-license.dto';
import { UpdateTenantDto } from '../tenants/dto/update-tenant.dto';
import { UpdateTenantStatusDto } from '../tenants/dto/update-tenant-status.dto';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.SuperAdmin)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('tenants')
  findAll() {
    return this.superAdminService.findAllTenants();
  }

  @Post('tenants')
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.superAdminService.create(createTenantDto);
  }

  @Post('users/:userId/resend-invitation')
  resendInvitation(@Param('userId') userId: string) {
    return this.superAdminService.resendInvitation(userId);
  }

  @Patch('tenants/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.superAdminService.updateTenant(id, updateTenantDto);
  }

  @Patch('tenants/:id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTenantStatusDto: UpdateTenantStatusDto,
  ) {
    return this.superAdminService.updateTenantStatus(id, updateTenantStatusDto.status);
  }

  @Delete('tenants/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTenant(@Param('id', ParseUUIDPipe) id: string) {
    return this.superAdminService.deleteTenant(id);
  }

  // License Management
  @Post('tenants/:tenantId/license')
  generateLicense(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() generateLicenseDto: GenerateLicenseDto,
  ) {
    return this.superAdminService.generateTenantLicense(tenantId, generateLicenseDto);
  }

  @Delete('tenants/:tenantId/license')
  revokeLicense(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.superAdminService.revokeTenantLicense(tenantId);
  }
}