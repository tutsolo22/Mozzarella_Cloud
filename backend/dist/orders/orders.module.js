"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const orders_service_1 = require("./orders.service");
const orders_controller_1 = require("./orders.controller");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const inventory_movements_module_1 = require("../inventory-movements/inventory-movements.module");
const notifications_module_1 = require("../notifications/notifications.module");
const ingredients_module_1 = require("../ingredients/ingredients.module");
const product_entity_1 = require("../products/entities/product.entity");
const tenant_configuration_entity_1 = require("../tenants/entities/tenant-configuration.entity");
const geocoding_module_1 = require("../geocoding/geocoding.module");
const payments_module_1 = require("../payments/payments.module");
const user_entity_1 = require("../users/entities/user.entity");
const location_entity_1 = require("../locations/entities/location.entity");
const ingredient_entity_1 = require("../ingredients/entities/ingredient.entity");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                order_entity_1.Order,
                order_item_entity_1.OrderItem,
                product_entity_1.Product,
                tenant_configuration_entity_1.TenantConfiguration,
                user_entity_1.User,
                location_entity_1.Location,
                ingredient_entity_1.Ingredient,
            ]),
            inventory_movements_module_1.InventoryMovementsModule,
            notifications_module_1.NotificationsModule,
            ingredients_module_1.IngredientsModule,
            (0, common_1.forwardRef)(() => payments_module_1.PaymentsModule),
            geocoding_module_1.GeocodingModule,
        ],
        controllers: [orders_controller_1.OrdersController],
        providers: [orders_service_1.OrdersService],
        exports: [orders_service_1.OrdersService],
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map