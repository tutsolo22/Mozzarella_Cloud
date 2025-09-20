import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { User, UserPayload } from '../auth/decorators/user.decorator';
import { ProfitAndLossReport } from './interfaces/pnl-report.interface';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.Admin, RoleEnum.Manager)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard-stats')
  getDashboardStats(@User() user: UserPayload) {
    // The implementation will likely depend on the tenant and location
    // from the user payload.
    return this.reportsService.getDashboardStats(
      user.tenantId,
      user.locationId,
    );
  }
  @Get('pnl')
  getProfitAndLossReport(
    @User() user: UserPayload,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<ProfitAndLossReport> {
    return this.reportsService.getProfitAndLossReport(
      user.tenantId,
      user.locationId,
      startDate,
      endDate,
    );
  }
}