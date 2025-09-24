import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { Tenant } from './entities/tenant.entity';
import { TenantConfiguration } from '../tenant-configuration/entities/tenant-configuration.entity';
import { FilesModule } from '../files/files.module';
import { HexaFactIntegrationModule } from '../integrations/hexafact/hexafact-integration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, TenantConfiguration]),
    FilesModule, // Import FilesModule to handle file uploads
    forwardRef(() => HexaFactIntegrationModule), // Usamos forwardRef para romper el ciclo
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}