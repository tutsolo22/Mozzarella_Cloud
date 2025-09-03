import { Controller, Get, UseGuards } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.SuperAdmin)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('tenants')
  findAllTenants() {
    return this.superAdminService.findAllTenants();
  }
}