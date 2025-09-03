import axiosClient from '../api/axiosClient';
import { LoginCredentials, User, CreateUserDto, UpdateUserDto } from '../types/user';
import { Order, OrderStatus } from '../types/order';
import { Product, Ingredient, ProductCategory, RecipeItem } from '../types/product';
import { OptimizedRoute } from '../types/delivery';
import { CashierSession } from '../types/reports';
import { TenantConfiguration } from '../types/tenant';
import { OverheadCost } from '../types/financials';

// --- Auth ---
export const login = async (credentials: LoginCredentials): Promise<{ access_token: string; user: User }> => {
  const response = await axiosClient.post('/auth/login', credentials);
  // El backend devuelve un objeto con { access_token, user }
  return response.data;
};

// --- Orders ---
export const getOrders = async (): Promise<Order[]> => {
  const response = await axiosClient.get('/orders');
  return response.data;
};

export const updateOrderStatus = async (orderId: string, newStatus: OrderStatus): Promise<Order> => {
  const response = await axiosClient.patch(`/orders/${orderId}/status`, { status: newStatus });
  return response.data;
};

export const getOrdersByStatus = async (statuses: OrderStatus[]): Promise<Order[]> => {
  const params = new URLSearchParams();
  statuses.forEach(status => params.append('statuses', status));
  const response = await axiosClient.get(`/orders/by-status?${params.toString()}`);
  return response.data;
};

export const updateOrderPriority = async (orderId: string, isPriority: boolean): Promise<Order> => {
  const response = await axiosClient.patch(`/orders/${orderId}/priority`, { isPriority });
  return response.data;
};

export const assignDriverToOrder = async (orderId: string, driverId: string): Promise<Order> => {
  const response = await axiosClient.patch(`/orders/${orderId}/assign-driver`, { driverId });
  return response.data;
};

export const setPreparationTime = async (orderId: string, preparationTimeMinutes: number): Promise<Order> => {
  const response = await axiosClient.patch(`/orders/${orderId}/prepare`, { preparationTimeMinutes });
  return response.data;
};

export const updateOrderCoordinates = async (orderId: string, latitude: number, longitude: number): Promise<Order> => {
  const response = await axiosClient.patch(`/orders/${orderId}/coordinates`, { latitude, longitude });
  return response.data;
};

export const getMyDeliveries = async (): Promise<Order[]> => {
  // Este endpoint debe ser creado en el backend.
  // Devolverá los pedidos del día asignados al repartidor autenticado.
  const response = await axiosClient.get('/orders/my-deliveries');
  return response.data;
};

// --- Delivery ---
export const optimizeRoutes = async (maxOrdersPerDriver: number): Promise<OptimizedRoute[]> => {
  const response = await axiosClient.post('/delivery/optimize-routes', { maxOrdersPerDriver });
  return response.data;
};

// --- Users ---
export const getUsersByRole = async (role: string): Promise<User[]> => {
  const response = await axiosClient.get(`/users/by-role?role=${role}`);
  return response.data;
};

export const updateUser = async (userId: string, data: Partial<User>): Promise<User> => {
  const response = await axiosClient.patch(`/users/${userId}`, data);
  return response.data;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await axiosClient.get('/users');
  return response.data;
};

export const createUser = async (data: CreateUserDto): Promise<User> => {
  const response = await axiosClient.post('/users', data);
  return response.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await axiosClient.delete(`/users/${userId}`);
};

// --- Financials ---
export const getOverheadCosts = async (startDate?: string, endDate?: string): Promise<OverheadCost[]> => {
  const response = await axiosClient.get('/financials/overhead-costs', { params: { startDate, endDate } });
  return response.data;
};

export const createOverheadCost = async (data: Partial<OverheadCost>): Promise<OverheadCost> => {
  const response = await axiosClient.post('/financials/overhead-costs', data);
  return response.data;
};

export const updateOverheadCost = async (id: string, data: Partial<OverheadCost>): Promise<OverheadCost> => {
  const response = await axiosClient.patch(`/financials/overhead-costs/${id}`, data);
  return response.data;
};

export const deleteOverheadCost = async (id: string): Promise<void> => {
  await axiosClient.delete(`/financials/overhead-costs/${id}`);
};

// --- Tenant Configuration ---
export const getTenantConfiguration = async (): Promise<TenantConfiguration> => {
  const response = await axiosClient.get('/tenants/configuration');
  return response.data;
};

export const updateTenantConfiguration = async (data: Partial<TenantConfiguration>): Promise<TenantConfiguration> => {
  const response = await axiosClient.patch('/tenants/configuration', data);
  return response.data;
};