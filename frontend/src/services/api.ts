import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getWasteReport = async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/ingredients/reports/waste?${params.toString()}`);
    return response.data;
};

export const getTenants = async () => {
  const response = await api.get('/super-admin/tenants');
  return response.data;
};

export const updateTenantStatus = async (tenantId: string, status: string) => {
  const response = await api.patch(`/super-admin/tenants/${tenantId}/status`, { status });
  return response.data;
};

interface LicenseData {
  userLimit: number;
  branchLimit: number;
  durationInDays: number;
}
export const generateLicense = async (tenantId: string, data: LicenseData) => {
  const response = await api.post(`/super-admin/tenants/${tenantId}/license`, data);
  return response.data;
};

export const requestPasswordReset = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token: string, password: string) => {
  const response = await api.post('/auth/reset-password', { token, password });
  return response.data;
};

export const revokeLicense = async (tenantId: string) => {
  const response = await api.post(`/super-admin/tenants/${tenantId}/license/revoke`);
  return response.data;
};

// --- Super Admin API ---

export const getSuperAdminDashboardStats = async () => {
  const response = await api.get('/super-admin/dashboard-stats');
  return response.data;
};

// --- Products API ---

export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const createProduct = async (productData: any) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id: string, productData: any) => {
  const response = await api.patch(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  await api.delete(`/products/${id}`);
};

export const uploadProductImage = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/products/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// --- Product Categories API ---

export const getProductCategories = async () => {
  const response = await api.get('/product-categories');
  return response.data;
};

// --- Ingredients API ---

export const getIngredients = async () => {
  const response = await api.get('/ingredients');
  return response.data;
};

export const createIngredient = async (data: any) => {
  const response = await api.post('/ingredients', data);
  return response.data;
};

export const updateIngredient = async (id: string, data: any) => {
  const response = await api.patch(`/ingredients/${id}`, data);
  return response.data;
};

export const deleteIngredient = async (id: string) => {
  await api.delete(`/ingredients/${id}`);
};

export const purchaseIngredients = async (items: any[]) => {
  await api.post('/ingredients/purchase', { items });
};

export const registerWaste = async (items: any[]) => {
  await api.post('/ingredients/waste', { items });
};

export const adjustStock = async (items: any[]) => {
  await api.post('/ingredients/adjust-stock', { items });
};

// --- Recipe API ---

export const getProductRecipe = async (productId: string) => {
  const response = await api.get(`/products/${productId}/ingredients`);
  return response.data;
};

export const assignProductRecipe = async (productId: string, ingredients: any[]) => {
  await api.post(`/products/${productId}/ingredients`, { ingredients });
};

// --- Orders API ---

export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await api.patch(`/orders/${orderId}/status`, { status });
  return response.data;
};

export const createOrder = async (items: { productId: string; quantity: number; notes?: string }[]) => {
  const response = await api.post('/orders', { items });
  return response.data;
};

// --- Reports API ---

export const getSalesReport = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await api.get(`/orders/reports/sales?${params.toString()}`);
  return response.data;
};

export const getIngredientConsumptionReport = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await api.get(`/orders/reports/ingredient-consumption?${params.toString()}`);
  return response.data;
};

export const getProductProfitabilityReport = async () => {
  const response = await api.get('/orders/reports/profitability');
  return response.data;
};

// --- Notifications API ---

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationAsRead = async (id: string) => {
  await api.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async () => {
  await api.post('/notifications/read-all');
};