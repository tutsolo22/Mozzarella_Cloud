import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TenantsService } from './tenants.service';
import { TenantConfiguration } from './entities/tenant-configuration.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/enums/role.enum';
import { User, UserPayload } from '../auth/decorators/user.decorator';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.Admin, RoleEnum.Manager)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('configuration')
  getConfiguration(@User() user: UserPayload): Promise<TenantConfiguration> {
    return this.tenantsService.getConfiguration(user.tenantId);
  }

  @Patch('configuration')
  updateConfiguration(
    @User() user: UserPayload,
    @Body() updateConfigDto: Partial<TenantConfiguration>,
  ): Promise<TenantConfiguration> {
    return this.tenantsService.updateConfiguration(user.tenantId, updateConfigDto);
  }

  @Post('configuration/kds-sound')
  @UseInterceptors(FileInterceptor('file'))
  setKdsSound(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 }), // 1MB
          new FileTypeValidator({ fileType: 'audio/mpeg' }), // Validates for .mp3
        ],
      }),
    )
    file: Express.Multer.File,
    @User() user: UserPayload,
  ) {
    return this.tenantsService.setKdsSound(user.tenantId, file);
  }

  @Delete('configuration/kds-sound')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeKdsSound(@User() user: UserPayload) {
    return this.tenantsService.setKdsSound(user.tenantId, null);
  }
}