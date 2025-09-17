import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository, In } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { InventoryMovement } from '../inventory-movements/entities/inventory-movement.entity';
import { InventoryMovementType } from '../inventory-movements/enums/inventory-movement-type.enum';
import { Employee, PaymentFrequency } from '../hr/entities/employee.entity';
import { OverheadCost } from '../financials/entities/overhead-cost.entity';
import { ProfitAndLossReport } from './interfaces/pnl-report.interface';
import * as dayjs from 'dayjs';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(InventoryMovement)
    private readonly movementRepository: Repository<InventoryMovement>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(OverheadCost)
    private readonly overheadCostRepository: Repository<OverheadCost>,
  ) {}

  async getProfitAndLossReport(
    tenantId: string,
    locationId: string,
    startDateStr: string,
    endDateStr: string,
  ): Promise<ProfitAndLossReport> {
    const startDate = dayjs(startDateStr).startOf('day').toDate();
    const endDate = dayjs(endDateStr).endOf('day').toDate();

    // 1. Calculate Total Revenue
    const revenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'totalRevenue')
      .where({
        tenantId,
        locationId,
        createdAt: Between(startDate, endDate),
        status: In([OrderStatus.Confirmed, OrderStatus.Delivered]),
      })
      .getRawOne();
    const totalRevenue = parseFloat(revenueResult.totalRevenue) || 0;

    // 2. Calculate Cost of Goods Sold (COGS)
    // Assumes inventory movements of type 'Sale' have a negative 'cost' value representing the cost of goods.
    const cogsResult = await this.movementRepository
      .createQueryBuilder('movement')
      .select('SUM(movement.cost)', 'totalCogs')
      .where({
        tenantId,
        locationId,
        createdAt: Between(startDate, endDate),
        type: InventoryMovementType.Sale,
      })
      .getRawOne();
    // COGS is negative in movements, so we make it positive for the report
    const costOfGoodsSold = Math.abs(parseFloat(cogsResult.totalCogs)) || 0;

    // 3. Calculate Labor Cost
    const employees = await this.employeeRepository.find({
      where: {
        tenantId,
        user: { locationId }, // Correctly filter through the user relation
      },
    });
    const daysInPeriod = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
    let totalLaborCost = 0;
    for (const employee of employees) {
      let dailySalary = 0;
      switch (employee.paymentFrequency) {
        case PaymentFrequency.Daily:
          dailySalary = employee.salary;
          break;
        case PaymentFrequency.Weekly:
          dailySalary = employee.salary / 7;
          break;
        case PaymentFrequency.BiWeekly:
          dailySalary = employee.salary / 14;
          break;
        case PaymentFrequency.Monthly:
          dailySalary = employee.salary / 30; // Approximation
          break;
      }
      totalLaborCost += dailySalary * daysInPeriod;
    }
    const laborCost = totalLaborCost;

    // 4. Calculate Overhead Costs
    const overheadResult = await this.overheadCostRepository
      .createQueryBuilder('cost')
      .select('SUM(cost.amount)', 'totalOverhead')
      .where({
        tenantId,
        locationId,
        date: Between(startDate, endDate),
      })
      .getRawOne();
    const overheadCosts = parseFloat(overheadResult.totalOverhead) || 0;

    // 5. Calculate Profits
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
}