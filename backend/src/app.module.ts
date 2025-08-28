// Módulo raíz de la aplicación NestJS.
// Aquí se importarán todos los demás módulos.
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { ProductsModule } from './products/products.module';
import { CustomersModule } from './customers/customers.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { OrdersModule } from './orders/orders.module';
import { InventoryMovementsModule } from './inventory-movements/inventory-movements.module';
import { LicenseValidationModule } from './license-validation/license-validation.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { FilesModule } from './files/files.module';
import { AppService } from './app.service';
import { NotificationsModule } from './notifications/notifications.module';

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
        synchronize: true, // ¡Solo para desarrollo! Sincroniza el esquema de la BD.
      }),
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CustomersModule,
    IngredientsModule,
    OrdersModule,
    InventoryMovementsModule,
    LicenseValidationModule,
    SuperAdminModule,
    FilesModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}