import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { UpdateTenantConfigurationDto } from './dto/update-tenant-configuration.dto';
import { FilesService } from '../files/files.service';
import * as path from 'path';

@Controller('tenants')
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly filesService: FilesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.SuperAdmin) // Solo el SuperAdmin puede crear nuevos tenants
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get('configuration')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  getConfiguration(@Req() req) {
    const { tenantId } = req.user;
    return this.tenantsService.getConfiguration(tenantId);
  }

  @Patch('configuration')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  updateConfiguration(@Req() req, @Body() updateDto: UpdateTenantConfigurationDto) {
    const { tenantId } = req.user;
    return this.tenantsService.updateConfiguration(tenantId, updateDto);
  }

  @Post('configuration/kds-sound')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @UseInterceptors(FileInterceptor('file'))
  async uploadKdsSound(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 }), // 1MB
          new FileTypeValidator({ fileType: 'audio/mpeg' }), // para .mp3
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Req() req,
  ) {
    const { tenantId } = req.user;
    const filename = `kds-notification-sound-${tenantId}${path.extname(file.originalname)}`;
    const fileUrl = await this.filesService.uploadPublicFile(file.buffer, filename, `tenant-assets/${tenantId}`);
    return this.tenantsService.updateConfiguration(tenantId, { kdsNotificationSoundUrl: fileUrl });
  }
}