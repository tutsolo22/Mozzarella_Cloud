import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, ForbiddenException } from '@nestjs/common';
import { HrService } from './hr.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { User, UserPayload } from '../auth/decorators/user.decorator';

@Controller('hr')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.Admin, RoleEnum.Manager)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // --- Positions ---
  @Post('positions')
  createPosition(@Body() createPositionDto: any, @User() user: UserPayload) {
    return this.hrService.createPosition(createPositionDto, user.tenantId);
  }

  @Get('positions')
  findAllPositions(@User() user: UserPayload) {
    return this.hrService.findAllPositions(user.tenantId);
  }

  @Patch('positions/:id')
  updatePosition(@Param('id', ParseUUIDPipe) id: string, @Body() updatePositionDto: any, @User() user: UserPayload) {
    return this.hrService.updatePosition(id, updatePositionDto, user.tenantId);
  }

  @Delete('positions/:id')
  removePosition(@Param('id', ParseUUIDPipe) id: string, @User() user: UserPayload) {
    return this.hrService.removePosition(id, user.tenantId);
  }

  // --- Employees ---
  @Post('employees')
  createEmployee(@Body() createEmployeeDto: any, @User() user: UserPayload) {
    return this.hrService.createEmployee(createEmployeeDto, user.tenantId);
  }

  @Get('employees')
  findAllEmployees(@User() user: UserPayload) {
    if (user.role === RoleEnum.Admin) {
      // TenantAdmin can see all employees in their tenant
      return this.hrService.findAllEmployees(user.tenantId);
    }
    // A manager sees only employees from their location
    if (!user.locationId) {
      throw new ForbiddenException('No tienes una sucursal asignada.');
    }
    return this.hrService.findAllEmployees(user.tenantId, user.locationId);
  }

  @Patch('employees/:id')
  updateEmployee(@Param('id', ParseUUIDPipe) id: string, @Body() updateEmployeeDto: any, @User() user: UserPayload) {
    return this.hrService.updateEmployee(id, updateEmployeeDto, user.tenantId);
  }
}