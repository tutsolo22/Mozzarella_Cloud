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
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../orders/entities/order.entity");
const order_status_enum_1 = require("../orders/enums/order-status.enum");
const inventory_movement_entity_1 = require("../inventory-movements/entities/inventory-movement.entity");
const inventory_movement_type_enum_1 = require("../inventory-movements/enums/inventory-movement-type.enum");
const employee_entity_1 = require("../hr/entities/employee.entity");
const overhead_cost_entity_1 = require("../financials/entities/overhead-cost.entity");
const dayjs = require("dayjs");
let ReportsService = class ReportsService {
    constructor(orderRepository, movementRepository, employeeRepository, overheadCostRepository) {
        this.orderRepository = orderRepository;
        this.movementRepository = movementRepository;
        this.employeeRepository = employeeRepository;
        this.overheadCostRepository = overheadCostRepository;
    }
    async getProfitAndLossReport(tenantId, locationId, startDateStr, endDateStr) {
        const startDate = dayjs(startDateStr).startOf('day').toDate();
        const endDate = dayjs(endDateStr).endOf('day').toDate();
        const revenueResult = await this.orderRepository
            .createQueryBuilder('order')
            .select('SUM(order.totalAmount)', 'totalRevenue')
            .where({
            tenantId,
            locationId,
            createdAt: (0, typeorm_2.Between)(startDate, endDate),
            status: (0, typeorm_2.In)([order_status_enum_1.OrderStatus.Confirmed, order_status_enum_1.OrderStatus.Delivered]),
        })
            .getRawOne();
        const totalRevenue = parseFloat(revenueResult.totalRevenue) || 0;
        const cogsResult = await this.movementRepository
            .createQueryBuilder('movement')
            .select('SUM(movement.cost)', 'totalCogs')
            .where({
            tenantId,
            locationId,
            createdAt: (0, typeorm_2.Between)(startDate, endDate),
            type: inventory_movement_type_enum_1.InventoryMovementType.Sale,
        })
            .getRawOne();
        const costOfGoodsSold = Math.abs(parseFloat(cogsResult.totalCogs)) || 0;
        const employees = await this.employeeRepository.find({
            where: {
                tenantId,
                user: { locationId },
            },
        });
        const daysInPeriod = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
        let totalLaborCost = 0;
        for (const employee of employees) {
            let dailySalary = 0;
            switch (employee.paymentFrequency) {
                case employee_entity_1.PaymentFrequency.Daily:
                    dailySalary = employee.salary;
                    break;
                case employee_entity_1.PaymentFrequency.Weekly:
                    dailySalary = employee.salary / 7;
                    break;
                case employee_entity_1.PaymentFrequency.BiWeekly:
                    dailySalary = employee.salary / 14;
                    break;
                case employee_entity_1.PaymentFrequency.Monthly:
                    dailySalary = employee.salary / 30;
                    break;
            }
            totalLaborCost += dailySalary * daysInPeriod;
        }
        const laborCost = totalLaborCost;
        const overheadResult = await this.overheadCostRepository
            .createQueryBuilder('cost')
            .select('SUM(cost.amount)', 'totalOverhead')
            .where({
            tenantId,
            locationId,
            date: (0, typeorm_2.Between)(startDate, endDate),
        })
            .getRawOne();
        const overheadCosts = parseFloat(overheadResult.totalOverhead) || 0;
        const grossProfit = totalRevenue - costOfGoodsSold;
        const totalExpenses = laborCost + overheadCosts;
        const netProfit = grossProfit - totalExpenses;
        return {
            totalRevenue,
            costOfGoodsSold,
            grossProfit,
            laborCost,
            overheadCosts,
            totalExpenses,
            netProfit,
            period: {
                from: startDateStr,
                to: endDateStr,
            },
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(inventory_movement_entity_1.InventoryMovement)),
    __param(2, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(3, (0, typeorm_1.InjectRepository)(overhead_cost_entity_1.OverheadCost)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map