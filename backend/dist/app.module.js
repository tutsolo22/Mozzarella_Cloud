"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const app_controller_1 = require("./app.controller");
const products_module_1 = require("./products/products.module");
const customers_module_1 = require("./customers/customers.module");
const ingredients_module_1 = require("./ingredients/ingredients.module");
const orders_module_1 = require("./orders/orders.module");
const inventory_movements_module_1 = require("./inventory-movements/inventory-movements.module");
const license_validation_module_1 = require("./license-validation/license-validation.module");
const super_admin_module_1 = require("./super-admin/super-admin.module");
const files_module_1 = require("./files/files.module");
const app_service_1 = require("./app.service");
const notifications_module_1 = require("./notifications/notifications.module");
const geocoding_module_1 = require("./geocoding/geocoding.module");
const tenants_module_1 = require("./tenants/tenants.module");
const geofencing_module_1 = require("./geofencing/geofencing.module");
const delivery_module_1 = require("./delivery/delivery.module");
const hr_module_1 = require("./hr/hr.module");
const financials_module_1 = require("./financials/financials.module");
const reports_module_1 = require("./reports/reports.module");
const locations_module_1 = require("./locations/locations.module");
const kds_module_1 = require("./kds/kds.module");
const whatsapp_integration_module_1 = require("./whatsapp-integration/whatsapp-integration.module");
const promotions_module_1 = require("./promotions/promotions.module");
const payments_module_1 = require("./payments/payments.module");
const tasks_module_1 = require("./tasks/tasks.module");
const csv_module_1 = require("./csv/csv.module");
const seeding_module_1 = require("./seeding.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('POSTGRES_HOST'),
                    port: configService.get('POSTGRES_PORT'),
                    username: configService.get('POSTGRES_USER'),
                    password: configService.get('POSTGRES_PASSWORD'),
                    database: configService.get('POSTGRES_DB'),
                    autoLoadEntities: true,
                    synchronize: true,
                }),
            }),
            schedule_1.ScheduleModule.forRoot(),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            products_module_1.ProductsModule,
            customers_module_1.CustomersModule,
            ingredients_module_1.IngredientsModule,
            orders_module_1.OrdersModule,
            inventory_movements_module_1.InventoryMovementsModule,
            license_validation_module_1.LicenseValidationModule,
            super_admin_module_1.SuperAdminModule,
            files_module_1.FilesModule,
            notifications_module_1.NotificationsModule,
            geocoding_module_1.GeocodingModule,
            tenants_module_1.TenantsModule,
            geofencing_module_1.GeofencingModule,
            delivery_module_1.DeliveryModule,
            hr_module_1.HrModule,
            financials_module_1.FinancialsModule,
            reports_module_1.ReportsModule,
            locations_module_1.LocationsModule,
            kds_module_1.KdsModule,
            whatsapp_integration_module_1.WhatsappIntegrationModule,
            promotions_module_1.PromotionsModule,
            payments_module_1.PaymentsModule,
            tasks_module_1.TasksModule,
            csv_module_1.CsvModule,
            seeding_module_1.SeedingModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map