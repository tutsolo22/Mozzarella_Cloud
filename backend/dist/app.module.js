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
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const csv_module_1 = require("./csv/csv.module");
const customers_module_1 = require("./customers/customers.module");
const delivery_module_1 = require("./delivery/delivery.module");
const financials_module_1 = require("./financials/financials.module");
const files_module_1 = require("./files/files.module");
const geocoding_module_1 = require("./geocoding/geocoding.module");
const geofencing_module_1 = require("./geofencing/geofencing.module");
const hr_module_1 = require("./hr/hr.module");
const ingredients_module_1 = require("./ingredients/ingredients.module");
const inventory_movements_module_1 = require("./inventory-movements/inventory-movements.module");
const kds_module_1 = require("./kds/kds.module");
const license_validation_module_1 = require("./license-validation/license-validation.module");
const locations_module_1 = require("./locations/locations.module");
const logs_module_1 = require("./logs/logs.module");
const notifications_module_1 = require("./notifications/notifications.module");
const orders_module_1 = require("./orders/orders.module");
const payments_module_1 = require("./payments/payments.module");
const preparation_zones_module_1 = require("./preparation-zones/preparation-zones.module");
const products_module_1 = require("./products/products.module");
const promotions_module_1 = require("./promotions/promotions.module");
const reports_module_1 = require("./reports/reports.module");
const settings_module_1 = require("./settings/settings.module");
const super_admin_module_1 = require("./super-admin/super-admin.module");
const tasks_module_1 = require("./tasks/tasks.module");
const tenants_module_1 = require("./tenants/tenants.module");
const users_module_1 = require("./users/users.module");
const whatsapp_integration_module_1 = require("./whatsapp-integration/whatsapp-integration.module");
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
            csv_module_1.CsvModule,
            customers_module_1.CustomersModule,
            delivery_module_1.DeliveryModule,
            financials_module_1.FinancialsModule,
            files_module_1.FilesModule,
            geocoding_module_1.GeocodingModule,
            geofencing_module_1.GeofencingModule,
            hr_module_1.HrModule,
            ingredients_module_1.IngredientsModule,
            inventory_movements_module_1.InventoryMovementsModule,
            kds_module_1.KdsModule,
            license_validation_module_1.LicenseValidationModule,
            locations_module_1.LocationsModule,
            logs_module_1.LogsModule,
            notifications_module_1.NotificationsModule,
            orders_module_1.OrdersModule,
            payments_module_1.PaymentsModule,
            preparation_zones_module_1.PreparationZonesModule,
            products_module_1.ProductsModule,
            promotions_module_1.PromotionsModule,
            reports_module_1.ReportsModule,
            settings_module_1.SettingsModule,
            super_admin_module_1.SuperAdminModule,
            tasks_module_1.TasksModule,
            tenants_module_1.TenantsModule,
            users_module_1.UsersModule,
            whatsapp_integration_module_1.WhatsappIntegrationModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map