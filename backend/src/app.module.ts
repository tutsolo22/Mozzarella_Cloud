// Módulo raíz de la aplicación NestJS.
// Aquí se importarán todos los demás módulos.
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CsvModule } from './csv/csv.module';
import { CustomersModule } from './customers/customers.module';
import { DeliveryModule } from './delivery/delivery.module';
import { FinancialsModule } from './financials/financials.module';
import { FilesModule } from './files/files.module';
import { GeocodingModule } from './geocoding/geocoding.module';
import { GeofencingModule } from './geofencing/geofencing.module';
import { HrModule } from './hr/hr.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { InventoryMovementsModule } from './inventory-movements/inventory-movements.module';
import { KdsModule } from './kds/kds.module';
import { LicenseValidationModule } from './license-validation/license-validation.module';
import { LocationsModule } from './locations/locations.module';
import { LogsModule } from './logs/logs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { PreparationZonesModule } from './preparation-zones/preparation-zones.module';
import { ProductsModule } from './products/products.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { TasksModule } from './tasks/tasks.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { WhatsappIntegrationModule } from './whatsapp-integration/whatsapp-integration.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables de entorno estén disponibles en toda la app
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        autoLoadEntities: true, // Carga automáticamente las entidades
        synchronize: false, // Se deshabilita para usar migraciones de forma controlada.
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    CsvModule,
    CustomersModule,
    DeliveryModule,
    FinancialsModule,
    FilesModule,
    GeocodingModule,
    GeofencingModule,
    HrModule,
    IngredientsModule,
    InventoryMovementsModule,
    KdsModule,
    LicenseValidationModule,
    LocationsModule,
    LogsModule,
    NotificationsModule,
    OrdersModule,
    PaymentsModule,
    PreparationZonesModule,
    ProductsModule,
    PromotionsModule,
    ReportsModule,
    SettingsModule,
    SuperAdminModule,
    TasksModule,
    TenantsModule,
    UsersModule,
    WhatsappIntegrationModule,
    ApiKeysModule,
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}