export interface WeeklySale {
  date: string;
  sales: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  pendingOrders: number;
  readyOrders: number;
  weeklySales: WeeklySale[];
  statusCounts: StatusCount[];
}

export interface ManagerDashboardMetrics {
  todaySales: number;
  todayOrders: number;
  statusCounts: {
    confirmed: number;
    in_preparation: number;
    in_delivery: number;
    delivered: number;
  };
  weeklySales: WeeklySale[];
}