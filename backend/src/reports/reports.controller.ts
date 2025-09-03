import { Controller, Get, UseGuards, ForbiddenException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { User, UserPayload } from '../auth/decorators/user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('manager-dashboard')
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  getManagerDashboardMetrics(@User() user: UserPayload) {
    // For a manager, locationId is mandatory. For an admin, it's provided by the LocationContext.
    if (!user.locationId) {
      throw new ForbiddenException('No tienes una sucursal asignada o seleccionada para ver este dashboard.');
    }
    return this.reportsService.getManagerDashboardMetrics(user.tenantId, user.locationId);
  }
}