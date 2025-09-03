export interface ManagerDashboardMetrics {
  todaySales: number;
  todayOrders: number;
  statusCounts: {
    confirmed: number;
    in_preparation: number;
    in_delivery: number;
    delivered: number;
  };
  weeklySales: { date: string; sales: number }[];
}
