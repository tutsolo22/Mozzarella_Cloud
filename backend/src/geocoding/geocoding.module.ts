import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GeocodingService } from './geocoding.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TenantConfiguration } from '../tenants/entities/tenant-configuration.entity';

@Module({
  imports: [
    HttpModule, // Importamos HttpModule para hacer peticiones
    ConfigModule, // Para acceder a las variables de entorno
    TypeOrmModule.forFeature([Tenant, TenantConfiguration]),
  ],
  providers: [GeocodingService],
  exports: [GeocodingService], // Exportamos el servicio para que otros módulos puedan usarlo
})
export class GeocodingModule {}