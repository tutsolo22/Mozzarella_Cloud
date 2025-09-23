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
var GeofencingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeofencingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../orders/entities/order.entity");
const order_status_enum_1 = require("../orders/enums/order-status.enum");
const tenant_configuration_entity_1 = require("../tenant-configuration/entities/tenant-configuration.entity");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const PROXIMITY_THRESHOLD_KM = 0.5;
let GeofencingService = GeofencingService_1 = class GeofencingService {
    constructor(orderRepository, tenantConfigRepository, notificationsGateway, httpService) {
        this.orderRepository = orderRepository;
        this.tenantConfigRepository = tenantConfigRepository;
        this.notificationsGateway = notificationsGateway;
        this.httpService = httpService;
        this.logger = new common_1.Logger(GeofencingService_1.name);
    }
    getDistance(p1, p2) {
        const R = 6371;
        const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
        const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((p1.lat * Math.PI) / 180) *
                Math.cos((p2.lat * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    async getEta(start, end, apiKey) {
        const url = 'https://api.openrouteservice.org/v2/directions/driving-car';
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, {
                coordinates: [[start.lng, start.lat], [end.lng, end.lat]],
            }, { headers: { Authorization: apiKey } }));
            const durationInSeconds = response.data.routes[0]?.summary?.duration;
            return durationInSeconds ? Math.ceil(durationInSeconds / 60) : null;
        }
        catch (error) {
            this.logger.error('Error al obtener ETA de OpenRouteService', error.response?.data);
            return null;
        }
    }
    async checkDriverProximity(driverId, tenantId, driverLocation) {
        const tenantConfig = await this.tenantConfigRepository.findOneBy({ tenantId });
        if (!tenantConfig?.restaurantLatitude || !tenantConfig?.restaurantLongitude) {
            return;
        }
        const restaurantLocation = {
            lat: tenantConfig.restaurantLatitude,
            lng: tenantConfig.restaurantLongitude,
        };
        const distance = this.getDistance(driverLocation, restaurantLocation);
        if (distance <= PROXIMITY_THRESHOLD_KM) {
            const ordersToNotify = await this.orderRepository.find({
                where: {
                    assignedDriverId: driverId,
                    status: order_status_enum_1.OrderStatus.InDelivery,
                    pickupNotificationSent: false,
                },
            });
            if (ordersToNotify.length === 0)
                return;
            const etaMinutes = tenantConfig.directionsApiKey
                ? await this.getEta(driverLocation, restaurantLocation, tenantConfig.directionsApiKey)
                : null;
            for (const order of ordersToNotify) {
                order.pickupNotificationSent = true;
                if (etaMinutes !== null) {
                    const arrivalTime = new Date();
                    arrivalTime.setMinutes(arrivalTime.getMinutes() + etaMinutes);
                    order.estimatedPickupArrivalAt = arrivalTime;
                }
                await this.orderRepository.save(order);
            }
        }
    }
};
exports.GeofencingService = GeofencingService;
exports.GeofencingService = GeofencingService = GeofencingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(tenant_configuration_entity_1.TenantConfiguration)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => notifications_gateway_1.NotificationsGateway))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_gateway_1.NotificationsGateway,
        axios_1.HttpService])
], GeofencingService);
//# sourceMappingURL=geofencing.service.js.map