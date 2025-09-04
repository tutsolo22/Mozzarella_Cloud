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
var TasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../orders/entities/order.entity");
const order_status_enum_1 = require("../orders/enums/order-status.enum");
const dayjs = require("dayjs");
let TasksService = TasksService_1 = class TasksService {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
        this.logger = new common_1.Logger(TasksService_1.name);
    }
    async handlePendingPaymentReminders() {
        this.logger.log('Ejecutando tarea de recordatorios de pago pendiente...');
        const tenMinutesAgo = dayjs().subtract(10, 'minutes').toDate();
        const pendingOrders = await this.orderRepository.find({
            where: {
                status: order_status_enum_1.OrderStatus.PendingPayment,
                createdAt: (0, typeorm_2.LessThan)(tenMinutesAgo),
            },
            relations: ['customer'],
        });
        if (pendingOrders.length === 0) {
            this.logger.log('No hay pedidos con pago pendiente que requieran recordatorio.');
            return;
        }
        this.logger.log(`Enviando ${pendingOrders.length} recordatorios...`);
        for (const order of pendingOrders) {
            this.logger.log(`Simulando envío de recordatorio para el pedido ${order.shortId} al cliente con ID ${order.customer?.id}.`);
        }
    }
};
exports.TasksService = TasksService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "handlePendingPaymentReminders", null);
exports.TasksService = TasksService = TasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TasksService);
//# sourceMappingURL=tasks.service.js.map