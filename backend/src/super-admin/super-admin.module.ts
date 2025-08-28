import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { Tenant } from '../tenants/entities/tenant.entity';
import { LicensingModule } from '../licenses/licenses.module';
import { License } from '../licenses/entities/license.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, License]),
    LicensingModule,
  ],
  controllers: [SuperAdminController],
  providers: [SuperAdminService],
})
export class SuperAdminModule {}