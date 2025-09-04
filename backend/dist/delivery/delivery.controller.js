"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../roles/enums/role.enum");
const user_decorator_1 = require("../auth/decorators/user.decorator");
const route_optimization_service_1 = require("./services/route-optimization.service");
const optimize_routes_dto_1 = require("./dto/optimize-routes.dto");
const orders_service_1 = require("../orders/orders.service");
const users_service_1 = require("../users/users.service");
const tenants_service_1 = require("../tenants/tenants.service");
const order_status_enum_1 = require("../orders/enums/order-status.enum");
let DeliveryController = class DeliveryController {
    constructor(routeOptimizationService, usersService, ordersService, tenantsService) {
        this.routeOptimizationService = routeOptimizationService;
        this.usersService = usersService;
        this.ordersService = ordersService;
        this.tenantsService = tenantsService;
    }
    async optimizeRoutes(optimizeRoutesDto, user) {
        const { tenantId } = user;
        const { maxOrdersPerDriver } = optimizeRoutesDto;
        const [pendingOrders, availableDrivers, tenantConfig] = await Promise.all([
            this.ordersService.findByStatus([order_status_enum_1.OrderStatus.ReadyForDelivery], tenantId, user.locationId),
            this.usersService.findByRoles([role_enum_1.RoleEnum.Delivery], tenantId, user.locationId),
            this.tenantsService.getConfiguration(tenantId),
        ]);
        if (!tenantConfig?.restaurantLatitude || !tenantConfig?.restaurantLongitude) {
            throw new common_1.BadRequestException('La ubicación del restaurante no está configurada.');
        }
        const restaurantLocation = { lat: tenantConfig.restaurantLatitude, lng: tenantConfig.restaurantLongitude };
        return this.routeOptimizationService.optimizeRoutes(pendingOrders, availableDrivers, { maxOrdersPerDriver }, restaurantLocation, tenantConfig.directionsApiKey);
    }
};
exports.DeliveryController = DeliveryController;
__decorate([
    (0, common_1.Post)('optimize-routes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.User)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [optimize_routes_dto_1.OptimizeRoutesDto, Object]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "optimizeRoutes", null);
exports.DeliveryController = DeliveryController = __decorate([
    (0, common_1.Controller)('delivery'),
    __metadata("design:paramtypes", [route_optimization_service_1.RouteOptimizationService,
        users_service_1.UsersService,
        orders_service_1.OrdersService,
        tenants_service_1.TenantsService])
], DeliveryController);
//# sourceMappingURL=delivery.controller.js.map