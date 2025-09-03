import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { User, UserPayload } from '../auth/decorators/user.decorator';
import { TenantConfigurationService } from './tenant-configuration.service';
import { UpdateTenantConfigurationDto } from './dto/update-tenant-configuration.dto';
import { TenantConfiguration } from '../tenants/entities/tenant-configuration.entity';

@Controller('tenant/configuration')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantConfigurationController {
  constructor(private readonly configService: TenantConfigurationService) {}

  @Get()
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  getConfiguration(@User() user: UserPayload): Promise<TenantConfiguration> {
    return this.configService.getConfiguration(user.tenantId);
  }

  @Patch()
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  updateConfiguration(
    @User() user: UserPayload,
    @Body() updateDto: UpdateTenantConfigurationDto,
  ): Promise<TenantConfiguration> {
    return this.configService.updateConfiguration(user.tenantId, updateDto);
  }
}