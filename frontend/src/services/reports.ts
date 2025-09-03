import api from '../api/axiosClient';
import { CashierSession } from '../types/reports';
import { DashboardStats, ManagerDashboardMetrics } from '../types/dashboard';

export const getDashboardStats = (): Promise<DashboardStats> => {
  return api.get('/reports/dashboard-stats');
};

export const getManagerDashboardMetrics = async (): Promise<ManagerDashboardMetrics> => {
  const response = await api.get('/reports/manager-dashboard');
  return response.data;
};

export const getActiveSession = async (): Promise<CashierSession | null> => {
  const response = await api.get('/reports/sessions/active');
  if (response.data === '') {
    return null;
  }
  return response.data;
};

export const openSession = (openingBalance: number): Promise<CashierSession> => {
  return api.post('/reports/sessions/open', { openingBalance });
};

export const closeSession = (data: { closingBalance: number; notes?: string }): Promise<CashierSession> => {
  return api.post('/reports/sessions/close', data);
};

export const getSessionReport = (sessionId: string): Promise<CashierSession> => {
  return api.get(`/reports/sessions/${sessionId}`);
};

export const getHistoricalSessions = (startDate?: string, endDate?: string): Promise<CashierSession[]> => {
  return api.get('/reports/sessions', { params: { startDate, endDate } });
};

export const getDriverSettlementReport = (sessionId: string): Promise<any> => {
  return api.get(`/reports/sessions/${sessionId}/driver-settlement`);
};