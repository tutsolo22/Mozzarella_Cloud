import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Get,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { ApiKey } from './entities/api-key.entity';
import { UpsertApiKeyDto } from './dto/upsert-api-key.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Super Admin - API Keys')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller('super-admin/tenants/:tenantId/api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  upsert(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() upsertApiKeyDto: UpsertApiKeyDto,
  ): Promise<ApiKey> {
    return this.apiKeysService.upsert(tenantId, upsertApiKeyDto);
  }

  @Get()
  findAllForTenant(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
  ): Promise<ApiKey[]> {
    return this.apiKeysService.findAllForTenant(tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.apiKeysService.remove(id, tenantId);
  }
}