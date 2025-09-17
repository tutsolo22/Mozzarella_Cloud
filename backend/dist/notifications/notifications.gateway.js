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
var NotificationsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const role_enum_1 = require("../roles/enums/role.enum");
let NotificationsGateway = NotificationsGateway_1 = class NotificationsGateway {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.activeDrivers = new Map();
        this.logger = new common_1.Logger(NotificationsGateway_1.name);
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token?.split(' ')[1];
            if (!token)
                throw new Error('Token de autenticación no encontrado');
            const payload = await this.jwtService.verifyAsync(token);
            if (!payload || !payload.userId)
                throw new Error('Payload de token inválido');
            client.data.userId = payload.userId;
            client.data.tenantId = payload.tenantId;
            client.data.role = payload.role;
            client.data.fullName = payload.fullName;
            client.join(`user-${payload.userId}`);
            this.logger.log(`Cliente conectado y unido a la sala: user-${payload.userId}`);
            const userRole = payload.role;
            const tenantId = payload.tenantId;
            if (tenantId) {
                if ([role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager].includes(userRole)) {
                    client.join(`tenant-${tenantId}-management`);
                    this.logger.log(`Usuario ${payload.userId} unido a la sala de management del tenant ${tenantId}`);
                }
                if ([role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager, role_enum_1.RoleEnum.Kitchen].includes(userRole)) {
                    client.join(`tenant-${tenantId}-kitchen`);
                    this.logger.log(`Usuario ${payload.userId} unido a la sala de cocina del tenant ${tenantId}`);
                }
                if (userRole === role_enum_1.RoleEnum.Delivery) {
                    this.activeDrivers.set(payload.userId, { name: payload.fullName, tenantId });
                    this.sendActiveDriversList(tenantId);
                }
            }
            if (userRole === role_enum_1.RoleEnum.SuperAdmin) {
                client.join('super-admin-room');
                this.logger.log(`SuperAdmin ${payload.userId} unido a la sala de super-admin.`);
            }
        }
        catch (error) {
            this.logger.error(`Fallo de autenticación de WebSocket: ${error.message}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const { userId, role, tenantId } = client.data;
        if (role === role_enum_1.RoleEnum.Delivery && userId && tenantId) {
            this.activeDrivers.delete(userId);
            this.sendActiveDriversList(tenantId);
            this.logger.log(`Repartidor ${userId} desconectado.`);
        }
        this.logger.log(`Cliente desconectado: ${client.id}`);
    }
    handleDriverLocation(data, client) {
        const { userId, tenantId, fullName } = client.data;
        if (!userId || !tenantId)
            return;
        const driverData = this.activeDrivers.get(userId);
        if (driverData)
            driverData.location = data;
        this.server.to(`tenant-${tenantId}-management`).emit('driver_location_update', {
            driverId: userId, name: fullName, location: data,
        });
    }
    sendToTenant(tenantId, event, data) {
        const kitchenRoom = `tenant-${tenantId}-kitchen`;
        this.server.to(kitchenRoom).emit(event, data);
        this.logger.log(`Evento '${event}' enviado a la sala de cocina '${kitchenRoom}'`);
        this.server.to(`tenant-${tenantId}-management`).emit(event, data);
    }
    sendNewDeliveryToDriver(driverId, order) {
        this.logger.log(`Enviando nuevo pedido #${order.shortId} al repartidor ${driverId}`);
        this.server.to(`user-${driverId}`).emit('new_delivery_for_driver', order);
    }
    sendLocationUpdateToDriver(driverId, order) {
        this.logger.log(`Enviando actualización de ubicación para pedido #${order.shortId} al repartidor ${driverId}`);
        this.server.to(`user-${driverId}`).emit('delivery_location_updated', order);
    }
    sendNewOrderToKitchen(tenantId, order) {
        this.logger.log(`Enviando nuevo pedido #${order.shortId} a la cocina del tenant ${tenantId}`);
        this.server.to(`tenant-${tenantId}-kitchen`).emit('new_order_for_kitchen', order);
    }
    sendOrderReadyNotification(tenantId, order) {
        this.logger.log(`Notificando que el pedido #${order.shortId} está listo al management del tenant ${tenantId}`);
        this.server.to(`tenant-${tenantId}-management`).emit('order_ready_for_dispatch', order);
    }
    sendOrderAssigned(tenantId, order) {
        this.logger.log(`Notificando que el pedido #${order.shortId} ha sido asignado al management del tenant ${tenantId}`);
        this.server.to(`tenant-${tenantId}-management`).emit('order_assigned', order);
    }
    sendOrderPriorityUpdate(tenantId, order) {
        this.logger.log(`Enviando actualización de prioridad para pedido #${order.shortId} al tenant ${tenantId}`);
        this.server.to(`tenant-${tenantId}-kitchen`).emit('order_priority_updated', order);
        this.server.to(`tenant-${tenantId}-management`).emit('order_priority_updated', order);
    }
    sendOrderStatusUpdate(tenantId, payload) {
        this.logger.log(`Enviando actualización de estado para pedido #${payload.order.shortId} de ${payload.previousStatus} a ${payload.newStatus}`);
        this.server.to(`tenant-${tenantId}-management`).emit('order_status_updated', payload);
        this.server.to('super-admin-room').emit('order_status_updated', payload);
    }
    sendActiveDriversList(tenantId) {
        const tenantDrivers = [];
        for (const [id, data] of this.activeDrivers.entries()) {
            if (data.tenantId === tenantId) {
                tenantDrivers.push([id, { name: data.name, location: data.location }]);
            }
        }
        this.server.to(`tenant-${tenantId}-management`).emit('active_drivers_update', tenantDrivers);
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('update_driver_location'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleDriverLocation", null);
exports.NotificationsGateway = NotificationsGateway = NotificationsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: 'notifications',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map