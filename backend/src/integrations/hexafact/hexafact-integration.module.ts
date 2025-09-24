import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ApiKeysModule } from '../../api-keys/api-keys.module';
import { HexaFactIntegrationService } from './hexafact-integration.service';
import { HexaFactIntegrationController } from './hexafact-integration.controller';
import { TenantsModule } from '../../tenants/tenants.module';

@Module({
  imports: [
    HttpModule, // Para hacer llamadas HTTP
    ConfigModule,
    ApiKeysModule, // Para obtener la API Key de forma segura
    forwardRef(() => TenantsModule), // Usamos forwardRef para romper el ciclo
  ],
  controllers: [HexaFactIntegrationController],
  providers: [HexaFactIntegrationService], // El guard se provee automáticamente por NestJS
  exports: [HexaFactIntegrationService],
})
export class HexaFactIntegrationModule {}