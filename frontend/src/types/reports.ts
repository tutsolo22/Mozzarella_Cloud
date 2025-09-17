export interface DashboardStats {
  confirmed: number;
  in_preparation: number;
  in_delivery: number;
  delivered: number;
  totalRevenueToday: number;
  totalOrdersToday: number;
}

export interface CashierSession {
  id: string;
  openingBalance: number;
  closingBalance?: number | null;
  openedAt: string;
  closedAt?: string | null;
  cashSales: number;
  cardSales: number;
  otherSales: number;
  totalSales: number;
  expectedCash: number;
  cashDifference: number;
  status: 'open' | 'closed';
  user: {
    id: string;
    fullName: string;
  };
}

export interface SalesReport {
  reportPeriod: { from: string; to: string };
  totalOrders: number;
  totalRevenue: number;
  productsBreakdown: {
    productId: string;
    productName: string;
    quantitySold: number;
    totalRevenue: number;
  }[];
}

export interface ProductProfitability {
  productId: string;
  productName: string;
  sellingPrice: number;
  ingredientsCost: number;
  profit: number;
  margin: number;
}

export interface ProfitAndLossReport {
  totalRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  laborCost: number;
  overheadCosts: number;
  totalExpenses: number;
  netProfit: number;
  period: {
    from: string;
    to: string;
  };
}