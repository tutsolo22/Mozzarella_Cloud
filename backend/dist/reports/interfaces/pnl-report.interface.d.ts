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
