import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { Tenant } from './entities/tenant.entity';
import { UsersModule } from '../users/users.module';
import { LicensingModule } from '../licenses/licenses.module';
import { TenantConfiguration } from './entities/tenant-configuration.entity';
import { Role } from '../roles/entities/role.entity';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, TenantConfiguration, Role]),
    forwardRef(() => UsersModule), // Evita dependencias circulares
    LicensingModule,
    FilesModule,
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}