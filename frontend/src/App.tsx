import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import RegisterPage from './pages/RegisterPage';
import TenantListPage from './pages/SuperAdmin/TenantListPage';
import ProductListPage from './pages/Products/ProductListPage';
import IngredientListPage from './pages/Ingredients/IngredientListPage';
import OrdersPage from './pages/Orders/OrdersPage';
import KDSPage from './pages/KDS/KDSPage';
import ProfitabilityReportPage from './pages/Reports/ProfitabilityReportPage';
import WasteReportPage from './pages/Reports/WasteReportPage';
import POSPage from './pages/POS/POSPage';
import SuperAdminDashboardPage from './pages/SuperAdmin/SuperAdminDashboardPage';
import { useAuth } from './hooks/useAuth';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" />;
};

const RoleRoute = ({ children, roles }: { children: JSX.Element; roles: string[] }) => {
  const { user } = useAuth();
  if (user && roles.includes(user.role)) {
    return children;
  }
  // Redirige a una página segura si el rol no coincide
  return <Navigate to="/dashboard" />;
};

function App() {
  return (
    <ConfigProvider locale={esES}>
      <Router>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route
                      path="/super-admin/dashboard"
                      element={
                        <RoleRoute roles={['super-admin']}>
                          <SuperAdminDashboardPage />
                        </RoleRoute>
                      }
                    />
                <Route path="/pos" element={<POSPage />} />
                <Route path="/kds" element={<KDSPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/reports/profitability" element={<ProfitabilityReportPage />} />
                <Route path="/reports/waste" element={<WasteReportPage />} />
                <Route path="/ingredients" element={<IngredientListPage />} />
                <Route path="/products" element={<ProductListPage />} />
                    <Route
                      path="/super-admin/tenants"
                      element={
                        <RoleRoute roles={['super-admin']}>
                          <TenantListPage />
                        </RoleRoute>
                      }
                    />
                    {/* Otras rutas privadas irían aquí */}
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;