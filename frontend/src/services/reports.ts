import axiosClient from '../api/axiosClient';
import { CashierSession, DashboardStats, ProductProfitability, SalesReport } from '../types/reports';

// --- Reports ---
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axiosClient.get('/reports/dashboard-stats');
  return response.data;
};

export const getActiveSession = async (): Promise<CashierSession | null> => {
  const response = await axiosClient.get('/cashier-sessions/active');
  return response.data;
};

export const openSession = async (openingBalance: number): Promise<CashierSession> => {
  const response = await axiosClient.post('/cashier-sessions/open', { openingBalance });
  return response.data;
};

export const closeSession = async (closingBalance: number): Promise<CashierSession> => {
  const response = await axiosClient.patch('/cashier-sessions/close', { closingBalance });
  return response.data;
};

const getSalesData = async (params: { startDate?: string; endDate?: string }): Promise<SalesReport> => {
  const response = await axiosClient.get('/orders/reports/sales', { params });
  return response.data;
};

export const getSalesReport = getSalesData;
export const getConsolidatedSalesReport = getSalesData;

export const getProductProfitabilityReport = async (): Promise<ProductProfitability[]> => {
  const response = await axiosClient.get('/orders/reports/profitability');
  return response.data;
};

export const getIngredientConsumptionReport = async (startDate: string, endDate: string): Promise<{ consumedIngredients: any[] }> => {
  const response = await axiosClient.get('/orders/reports/ingredient-consumption', {
    params: { startDate, endDate },
  });
  return response.data;
};

export const getWasteReport = async (startDate?: string, endDate?: string) => {
  const response = await axiosClient.get('/ingredients/reports/waste', {
    params: { startDate, endDate },
  });
  return response.data;
};

export const getDriverPerformanceReport = async (startDate?: string, endDate?: string) => {
  const response = await axiosClient.get('/orders/reports/driver-performance', {
    params: { startDate, endDate },
  });
  return response.data;
};