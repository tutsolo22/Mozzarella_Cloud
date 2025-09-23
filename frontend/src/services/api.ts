import axiosClient from '../api/axiosClient';
import { LoginCredentials, User, CreateUserDto, UpdateUserDto, ChangePasswordDto, UpdateProfileDto } from '../types/user';
import { Order, OrderStatus, CreateOrderItem } from '../types/order';
import { Product, Ingredient, RecipeItem, CreateProductDto, UpdateProductDto, CreateIngredientDto, UpdateIngredientDto } from '../types/product';
import { CreateTenantDto, Tenant, TenantConfiguration, TenantStatus, UpdateTenantDto } from '../types/tenant';
import { OptimizedRoute } from '../types/delivery';
import { OverheadCost } from '../types/financials';
import { Location, CreateLocationDto, UpdateLocationDto } from '../types/location';
import { CashierSession, ProfitAndLossReport } from '../types/reports';
import { Position, Employee, CreatePositionDto, UpdatePositionDto, CreateEmployeeDto, UpdateEmployeeDto } from '../types/hr';
import { DashboardStats } from '../types/dashboard';
import { Role } from '../types/role';
import { GenerateLicenseDto, License } from '../types/license';
import { ProductCategory } from '../types/product-category';
import { SmtpSettings, TestSmtpDto } from '../types/smtp';
import { PreparationZone, CreatePreparationZoneDto, UpdatePreparationZoneDto } from '../types/preparation-zone';

export interface SuperAdminStats {
  tenants: {
    total: number;
    active: number;
    trial: number;
    suspended: number;
  };
  licenses: {
    total: number;
    active: number;
    expired: number;
    revoked: number;
  };
  soonToExpire: {
    tenantId: string;
    tenantName: string;
    expiresAt: string;
  }[];
}

// --- Auth ---
export const login = async (credentials: LoginCredentials): Promise<{ access_token: string; user: User }> => {
  const response = await axiosClient.post('/auth/login', credentials);
  // El backend devuelve un objeto con { access_token, user }
  return response.data;
};

export const switchLocation = async (locationId: string): Promise<{ access_token: string; user: User }> => {
  const response = await axiosClient.patch('/auth/switch-location', { locationId });
  // NOTA: Esto requiere que el backend devuelva el objeto de usuario actualizado junto con el token.
  return response.data;
};

export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  const response = await axiosClient.post('/auth/request-password-reset', { email });
  return response.data;
};

export const resetPassword = async (token: string, password: string): Promise<{ message: string }> => {
  const response = await axiosClient.post('/auth/reset-password', { token, password });
  return response.data;
};

export const setupAccount = async (token: string, password: string): Promise<{ access_token: string; user: User }> => {
  const response = await axiosClient.post('/auth/setup-account', { token, password });
  return response.data;
};

/**
 * Envía el token de verificación de correo al backend.
 * @param token El token recibido en la URL.
 * @returns Una promesa que se resuelve si la verificación es exitosa.
 */
export const verifyEmail = (token: string) => {
  return axiosClient.post('/auth/verify-email', { token });
};

export const register = async (data: Record<string, any>): Promise<{ message: string }> => {
  const response = await axiosClient.post('/auth/register', data);
  return response.data;
};

export const changePassword = async (data: ChangePasswordDto): Promise<void> => {
  const response = await axiosClient.patch('/users/me/password', data);
  return response.data;
};

export const updateMyProfile = async (data: UpdateProfileDto): Promise<User> => {
  const response = await axiosClient.patch('/users/me', data);
  return response.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await axiosClient.get('/auth/profile');
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

// --- KDS ---
export const getKdsOrders = async (zoneId?: string): Promise<Order[]> => {
  const url = zoneId ? `/kds/orders/zone/${zoneId}` : '/kds/orders';
  const response = await axiosClient.get(url);
  return response.data;
};

// --- Products ---
export const getProducts = async (): Promise<Product[]> => {
  const response = await axiosClient.get('/products');
  return response.data;
};

export const createProduct = async (data: CreateProductDto): Promise<Product> => {
  const response = await axiosClient.post('/products', data);
  return response.data;
};

export const updateProduct = async (id: string, data: UpdateProductDto): Promise<Product> => {
  const response = await axiosClient.patch(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await axiosClient.delete(`/products/${id}`);
};

// --- Product Categories ---
export const getProductCategories = async (): Promise<ProductCategory[]> => {
  const response = await axiosClient.get('/product-categories');
  return response.data;
};

// --- Recipe ---
export const getRecipe = async (productId: string): Promise<RecipeItem[]> => {
  const response = await axiosClient.get(`/products/${productId}/ingredients`);
  return response.data;
};

export const updateRecipe = async (productId: string, items: { ingredientId: string; quantityRequired: number }[]): Promise<RecipeItem[]> => {
  const response = await axiosClient.post(`/products/${productId}/ingredients`, { ingredients: items });
  return response.data;
};

// --- Ingredients ---
export const getIngredients = async (): Promise<Ingredient[]> => {
  const response = await axiosClient.get('/ingredients');
  return response.data;
};

export const createIngredient = async (data: CreateIngredientDto): Promise<Ingredient> => {
  const response = await axiosClient.post('/ingredients', data);
  return response.data;
};

export const updateIngredient = async (id: string, data: UpdateIngredientDto): Promise<Ingredient> => {
  const response = await axiosClient.patch(`/ingredients/${id}`, data);
  return response.data;
};

export const deleteIngredient = async (id: string): Promise<void> => {
  await axiosClient.delete(`/ingredients/${id}`);
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

// --- HR ---
export const getPositions = async (): Promise<Position[]> => {
  const response = await axiosClient.get('/hr/positions');
  return response.data;
};

export const createPosition = async (data: CreatePositionDto): Promise<Position> => {
  const response = await axiosClient.post('/hr/positions', data);
  return response.data;
};

export const updatePosition = async (id: string, data: UpdatePositionDto): Promise<Position> => {
  const response = await axiosClient.patch(`/hr/positions/${id}`, data);
  return response.data;
};

export const deletePosition = async (positionId: string): Promise<void> => {
  await axiosClient.delete(`/hr/positions/${positionId}`);
};

export const getEmployees = async (): Promise<Employee[]> => {
  const response = await axiosClient.get('/hr/employees');
  return response.data;
};

export const createEmployee = async (data: CreateEmployeeDto): Promise<Employee> => {
  const response = await axiosClient.post('/hr/employees', data);
  return response.data;
};

export const updateEmployee = async (id: string, data: UpdateEmployeeDto): Promise<Employee> => {
  const response = await axiosClient.patch(`/hr/employees/${id}`, data);
  return response.data;
};

export const deleteEmployee = async (id: string): Promise<void> => {
  await axiosClient.delete(`/hr/employees/${id}`);
};

export const getRoles = async (): Promise<Role[]> => {
  const response = await axiosClient.get('/roles');
  return response.data;
};

// --- Locations ---
export const getLocations = async (includeInactive = false): Promise<Location[]> => {
  const response = await axiosClient.get('/locations', { params: { includeInactive } });
  return response.data;
};

export const createLocation = async (data: CreateLocationDto): Promise<Location> => {
  const response = await axiosClient.post('/locations', data);
  return response.data;
};

export const updateLocation = async (id: string, data: UpdateLocationDto): Promise<Location> => {
  const response = await axiosClient.patch(`/locations/${id}`, data);
  return response.data;
};

export const disableLocation = async (id: string): Promise<void> => {
  // El backend debe manejar DELETE como un borrado lógico (isActive: false)
  await axiosClient.delete(`/locations/${id}`);
};

export const enableLocation = async (id: string): Promise<Location> => {
  // El backend debe tener un endpoint para restaurar o reactivar
  const response = await axiosClient.patch(`/locations/${id}/enable`);
  return response.data;
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

// --- Reports ---
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axiosClient.get('/reports/dashboard-stats');
  return response.data;
};

export const getProfitAndLossReport = async (startDate: string, endDate: string): Promise<ProfitAndLossReport> => {
  const response = await axiosClient.get('/reports/pnl', { params: { startDate, endDate } });
  return response.data;
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

export const uploadTenantLogo = async (file: File): Promise<TenantConfiguration> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosClient.post('/tenants/configuration/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const uploadTenantLogoDark = async (file: File): Promise<TenantConfiguration> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosClient.post('/tenants/configuration/logo-dark', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const uploadTenantFavicon = async (file: File): Promise<TenantConfiguration> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosClient.post('/tenants/configuration/favicon', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const uploadKdsSound = async (file: File): Promise<TenantConfiguration> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosClient.post('/tenants/configuration/kds-sound', formData);
  return response.data;
};

export const deleteKdsSound = async (): Promise<void> => {
  await axiosClient.delete('/tenants/configuration/kds-sound');
};

export const uploadCsdCertFile = async (file: File): Promise<TenantConfiguration> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosClient.post('/tenants/configuration/csd-cert', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const uploadCsdKeyFile = async (file: File): Promise<TenantConfiguration> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosClient.post('/tenants/configuration/csd-key', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// --- Super Admin ---
export const getTenants = async (): Promise<Tenant[]> => {
  const response = await axiosClient.get('/super-admin/tenants');
  return response.data;
};

export const createTenant = async (data: CreateTenantDto): Promise<Tenant> => {
  const response = await axiosClient.post('/super-admin/tenants', data);
  return response.data;
};

export const updateTenant = async (tenantId: string, data: UpdateTenantDto): Promise<Tenant> => {
  const response = await axiosClient.patch(`/super-admin/tenants/${tenantId}`, data);
  return response.data;
};

export const updateTenantStatus = async (tenantId: string, status: TenantStatus): Promise<Tenant> => {
  const response = await axiosClient.patch(`/super-admin/tenants/${tenantId}/status`, { status });
  return response.data;
};

export const resendInvitation = async (userId: string): Promise<{ message: string }> => {
  const response = await axiosClient.post(`/super-admin/users/${userId}/resend-invitation`);
  return response.data;
};

export const getSuperAdminDashboardStats = async (): Promise<SuperAdminStats> => {
  const response = await axiosClient.get('/super-admin/dashboard/stats');
  return response.data;
};

export const testSmtpConnection = async (data: TestSmtpDto): Promise<{ success: boolean; message: string }> => {
  const response = await axiosClient.post('/settings/smtp/test-connection', data);
  return response.data;
};

export const getSmtpSettings = async (): Promise<SmtpSettings> => {
  const response = await axiosClient.get('/settings/smtp');
  return response.data;
};

export const saveSmtpSettings = async (data: SmtpSettings): Promise<void> => {
  await axiosClient.put('/settings/smtp', data);
};

export const generateLicense = async (tenantId: string, data: GenerateLicenseDto): Promise<License> => {
  const response = await axiosClient.post(`/super-admin/tenants/${tenantId}/license`, data);
  return response.data;
};

export const revokeLicense = async (tenantId: string): Promise<{ message: string }> => {
  const response = await axiosClient.delete(`/super-admin/tenants/${tenantId}/license`);
  return response.data;
};

export const deleteTenant = async (tenantId: string): Promise<void> => {
  await axiosClient.delete(`/super-admin/tenants/${tenantId}`);
};

export const sendConfiguredTestEmail = async (email: string): Promise<{ message: string }> => {
  const response = await axiosClient.post('/settings/smtp/send-test-email', { email });
  return response.data;
};

export const getLogFiles = async (): Promise<string[]> => {
  const response = await axiosClient.get('/super-admin/logs/files');
  return response.data;
};

export const getLogContent = async (fileName: string, lines: number): Promise<{ log: string }> => {
  const response = await axiosClient.get('/super-admin/logs', { params: { file: fileName, lines } });
  return response.data;
};

// --- Cashier Sessions History ---
export const getHistoricalSessions = async (): Promise<CashierSession[]> => {
  const response = await axiosClient.get('/cashier-sessions/history');
  return response.data;
};
// --- Zonas de Preparación ---

export const getPreparationZones = async (): Promise<PreparationZone[]> => {
  const response = await axiosClient.get('/preparation-zones');
  return response.data;
};

export const createPreparationZone = async (data: CreatePreparationZoneDto): Promise<PreparationZone> => {
  const response = await axiosClient.post('/preparation-zones', data);
  return response.data;
};

export const updatePreparationZone = async (id: string, data: UpdatePreparationZoneDto): Promise<PreparationZone> => {
  const response = await axiosClient.patch(`/preparation-zones/${id}`, data);
  return response.data;
};

export const deletePreparationZone = async (id: string): Promise<void> => {
  await axiosClient.delete(`/preparation-zones/${id}`);
};