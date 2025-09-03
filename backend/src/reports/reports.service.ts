import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { Repository } from 'typeorm';
import { OrderStatus } from '../enums/order-status.enum';
import * as dayjs from 'dayjs';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getManagerDashboardMetrics(tenantId: string, locationId: string) {
    const today = new Date();
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const endOfToday = new Date(new Date().setHours(23, 59, 59, 999));

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // 1. Today's Sales and Order Count
    const todayStats = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'totalSales')
      .addSelect('COUNT(order.id)', 'orderCount')
      .where('order.tenantId = :tenantId', { tenantId })
      .andWhere('order.locationId = :locationId', { locationId })
      .andWhere('order.createdAt BETWEEN :start AND :end', { start: startOfToday, end: endOfToday })
      .andWhere('order.status != :cancelled', { cancelled: OrderStatus.Cancelled })
      .getRawOne();

    // 2. Order Status Counts for Today
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

    // 3. Weekly Sales Trend
    const weeklySalesRaw = await this.orderRepository
      .createQueryBuilder('order')
      .select(`DATE(order.createdAt AT TIME ZONE 'UTC')`, 'date')
      .addSelect('SUM(order.totalAmount)', 'sales')
      .where('order.tenantId = :tenantId', { tenantId })
      .andWhere('order.locationId = :locationId', { locationId })
      .andWhere('order.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
      .andWhere('order.status != :cancelled', { cancelled: OrderStatus.Cancelled })
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
}