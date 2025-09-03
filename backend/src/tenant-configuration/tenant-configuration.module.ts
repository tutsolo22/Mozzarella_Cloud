import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantConfiguration } from '../tenants/entities/tenant-configuration.entity';
import { TenantConfigurationController } from './tenant-configuration.controller';
import { TenantConfigurationService } from './tenant-configuration.service';

@Module({
  imports: [TypeOrmModule.forFeature([TenantConfiguration])],
  controllers: [TenantConfigurationController],
  providers: [TenantConfigurationService],
})
export class TenantConfigurationModule {}