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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./entities/notification.entity");
const users_service_1 = require("../users/users.service");
const role_enum_1 = require("../roles/enums/role.enum");
const notification_type_enum_1 = require("./enums/notification-type.enum");
let NotificationsService = class NotificationsService {
    constructor(notificationRepository, usersService) {
        this.notificationRepository = notificationRepository;
        this.usersService = usersService;
    }
    async createLowStockNotification(ingredient, tenantId) {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const existingNotification = await this.notificationRepository.findOne({
            where: {
                tenantId,
                relatedEntityId: ingredient.id,
                type: notification_type_enum_1.NotificationType.LowStock,
                isRead: false,
                createdAt: (0, typeorm_2.MoreThan)(twentyFourHoursAgo),
            },
        });
        if (existingNotification) {
            return;
        }
        const usersToNotify = await this.usersService.findByRoles([role_enum_1.RoleEnum.Admin, role_enum_1.RoleEnum.Manager], tenantId);
        if (usersToNotify.length === 0)
            return;
        const message = `El ingrediente "${ingredient.name}" tiene stock bajo (${ingredient.stockQuantity} ${ingredient.unit}).`;
        const notifications = usersToNotify.map((user) => {
            return this.notificationRepository.create({
                tenantId,
                userId: user.id,
                message,
                type: notification_type_enum_1.NotificationType.LowStock,
                relatedEntityId: ingredient.id,
            });
        });
        await this.notificationRepository.save(notifications);
    }
    findAllForUser(userId) {
        return this.notificationRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }
    async markAsRead(id, userId) {
        await this.notificationRepository.update({ id, userId }, { isRead: true });
    }
    async markAllAsRead(userId) {
        await this.notificationRepository.update({ userId, isRead: false }, { isRead: true });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map