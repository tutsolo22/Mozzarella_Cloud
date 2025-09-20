import { Controller, Get, Query, UseGuards, ParseIntPipe, DefaultValuePipe, BadRequestException } from '@nestjs/common';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';

@Controller('super-admin/logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.SuperAdmin)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get('files')
  async getLogFiles(): Promise<string[]> {
    return this.logsService.getLogFiles();
  }

  @Get()
  async getLogs(
    @Query('file') fileName: string,
    @Query('lines', new DefaultValuePipe(200), ParseIntPipe) lines: number,
  ): Promise<{ log: string }> {
    if (!fileName) {
      throw new BadRequestException('El parámetro "file" es requerido.');
    }
    const logContent = await this.logsService.getLogContent(fileName, lines);
    return { log: logContent };
  }
}