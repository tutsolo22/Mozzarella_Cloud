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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const order_entity_1 = require("../orders/entities/order.entity");
const typeorm_2 = require("typeorm");
const order_status_enum_1 = require("../enums/order-status.enum");
const dayjs = require("dayjs");
let ReportsService = class ReportsService {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }
    async getManagerDashboardMetrics(tenantId, locationId) {
        const today = new Date();
        const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
        const endOfToday = new Date(new Date().setHours(23, 59, 59, 999));
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const todayStats = await this.orderRepository
            .createQueryBuilder('order')
            .select('SUM(order.totalAmount)', 'totalSales')
            .addSelect('COUNT(order.id)', 'orderCount')
            .where('order.tenantId = :tenantId', { tenantId })
            .andWhere('order.locationId = :locationId', { locationId })
            .andWhere('order.createdAt BETWEEN :start AND :end', { start: startOfToday, end: endOfToday })
            .andWhere('order.status != :cancelled', { cancelled: order_status_enum_1.OrderStatus.Cancelled })
            .getRawOne();
        const statusCountsRaw = await this.orderRepository
            .createQueryBuilder('order')
            .select('order.status', 'status')
            .addSelect('COUNT(order.id)::int', 'count')
            .where('order.tenantId = :tenantId', { tenantId })
            .andWhere('order.locationId = :locationId', { locationId })
            .andWhere('order.createdAt BETWEEN :start AND :end', { start: startOfToday, end: endOfToday })
            .groupBy('order.status')
            .getRawMany();
        const statusCounts = {
            confirmed: 0, in_preparation: 0, in_delivery: 0, delivered: 0,
            ...Object.fromEntries(statusCountsRaw.map(item => [item.status, item.count])),
        };
        const weeklySalesRaw = await this.orderRepository
            .createQueryBuilder('order')
            .select(`DATE(order.createdAt AT TIME ZONE 'UTC')`, 'date')
            .addSelect('SUM(order.totalAmount)', 'sales')
            .where('order.tenantId = :tenantId', { tenantId })
            .andWhere('order.locationId = :locationId', { locationId })
            .andWhere('order.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
            .andWhere('order.status != :cancelled', { cancelled: order_status_enum_1.OrderStatus.Cancelled })
            .groupBy(`DATE(order.createdAt AT TIME ZONE 'UTC')`)
            .orderBy('date', 'ASC')
            .getRawMany();
        const weeklySalesMap = new Map(weeklySalesRaw.map(item => [dayjs(item.date).format('YYYY-MM-DD'), parseFloat(item.sales)]));
        const weeklySales = Array.from({ length: 7 }).map((_, i) => {
            const date = dayjs().subtract(6 - i, 'day');
            const formattedDate = date.format('YYYY-MM-DD');
            return { date: formattedDate, sales: weeklySalesMap.get(formattedDate) || 0 };
        });
        return {
            todaySales: parseFloat(todayStats.totalSales) || 0,
            todayOrders: parseInt(todayStats.orderCount, 10) || 0,
            statusCounts,
            weeklySales,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map