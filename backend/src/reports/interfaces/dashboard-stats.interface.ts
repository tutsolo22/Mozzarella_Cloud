export interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  pendingOrders: number;
  readyOrders: number;
  weeklySales: { date: string; sales: number }[];
  statusCounts: { status: string; count: number }[];
}