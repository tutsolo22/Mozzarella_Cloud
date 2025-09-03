import React, { Suspense, FC } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Spin, ConfigProvider, theme as antdTheme } from 'antd';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LocationProvider } from './contexts/LocationContext';
// --- Placeholder for Role-Based Access Control ---
// In a real app, this would check the user's role and permissions
const Can: React.FC<{ perform: string; children: React.ReactElement }> = ({ children }) => {
  return children;
};

// --- Private Route Wrapper ---
import { useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/Login/LoginPage';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// --- Lazy Loaded Pages ---
const DashboardPage = React.lazy(() => import('./pages/Dashboard/DashboardPage'));
const KDSPage = React.lazy(() => import('./pages/KDS/KDSPage'));
const KDSSelectorPage = React.lazy(() => import('./pages/KDS/KDSSelectorPage'));
const ProductManagementPage = React.lazy(() => import('./pages/Products/ProductManagementPage'));
const ProductCategoryManagementPage = React.lazy(() => import('./pages/Products/ProductCategoryManagementPage'));
const IngredientManagementPage = React.lazy(() => import('./pages/Inventory/IngredientManagementPage'));
const DispatchPage = React.lazy(() => import('./pages/Delivery/DispatchPage'));
const UserManagementPage = React.lazy(() => import('./pages/Users/UserManagementPage'));
const LocationsManagementPage = React.lazy(() => import('./pages/Management/LocationsManagementPage'));
const TenantSettingsPage = React.lazy(() => import('./pages/Settings/TenantSettingsPage'));
const HRManagementPage = React.lazy(() => import('./pages/HR/HRManagementPage'));
const PromotionsManagementPage = React.lazy(() => import('./pages/Management/PromotionsManagementPage'));
const PreparationZoneManagementPage = React.lazy(() => import('./pages/Management/PreparationZoneManagementPage'));
const DriverPerformanceReportPage = React.lazy(() => import('./pages/Reports/DriverPerformanceReportPage'));
const CashierSessionPage = React.lazy(() => import('./pages/Reports/CashierSessionPage'));
const CashierHistoryPage = React.lazy(() => import('./pages/Reports/CashierHistoryPage'));
const ProductProfitabilityReportPage = React.lazy(() => import('./pages/Reports/ProductProfitabilityReportPage'));
const DriverSettlementReportPage = React.lazy(() => import('./pages/Reports/DriverSettlementReportPage'));
const OverheadCostsPage = React.lazy(() => import('./pages/Financials/OverheadCostsPage'));
const WasteReportPage = React.lazy(() => import('./pages/Reports/WasteReportPage'));
const SalesReportPage = React.lazy(() => import('./pages/Reports/SalesReportPage'));
const IngredientConsumptionReportPage = React.lazy(() => import('./pages/Reports/IngredientConsumptionReportPage'));
const ConsolidatedSalesReportPage = React.lazy(() => import('./pages/Reports/ConsolidatedSalesReportPage'));

const ThemedApp: FC = () => {
  const { theme } = useTheme();
  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <Router>
        <Suspense fallback={<Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <LocationProvider>
                    <MainLayout />
                  </LocationProvider>
                </PrivateRoute>
              }
            >
              {/* Main Routes */}
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="kds" element={
                <Can perform="view:kds">
                  <KDSSelectorPage />
                </Can>
              } />
              <Route path="kds/:zoneId" element={
                <Can perform="view:kds">
                  <KDSPage />
                </Can>
              } />
              <Route path="dispatch" element={
                <Can perform="manage:dispatch">
                  <DispatchPage />
                </Can>
              } />

              {/* Management Routes */}
              <Route path="management/products" element={
                <Can perform="manage:products">
                  <ProductManagementPage />
                </Can>
              } />
              <Route path="management/product-categories" element={
                <Can perform="manage:products">
                  <ProductCategoryManagementPage />
                </Can>
              } />
              <Route path="management/ingredients" element={
                <Can perform="manage:inventory">
                  <IngredientManagementPage />
                </Can>
              } />
              <Route path="management/promotions" element={
                <Can perform="manage:products">
                  <PromotionsManagementPage />
                </Can>
              } />
              <Route path="management/users" element={
                <Can perform="manage:users">
                  <UserManagementPage />
                </Can>
              } />
              <Route path="management/locations" element={
                <Can perform="manage:locations">
                  <LocationsManagementPage />
                </Can>
              } />
              <Route path="management/hr" element={
                <Can perform="manage:hr">
                  <HRManagementPage />
                </Can>
              } />
              <Route path="management/preparation-zones" element={
                <Can perform="manage:products">
                  <PreparationZoneManagementPage />
                </Can>
              } />
              <Route path="financials/overhead-costs" element={
                <Can perform="manage:financials">
                  <OverheadCostsPage />
                </Can>
              } />

              {/* Reports Routes */}
              <Route path="reports/consolidated-sales" element={
                <Can perform="view:consolidated_reports">
                  <ConsolidatedSalesReportPage />
                </Can>
              } />
              <Route path="reports/sales" element={
                <Can perform="view:reports">
                  <SalesReportPage />
                </Can>
              } />
              <Route path="reports/driver-performance" element={
                <Can perform="view:reports">
                  <DriverPerformanceReportPage />
                </Can>
              } />
              <Route path="reports/cashier-session" element={
                <Can perform="manage:cashier_session">
                  <CashierSessionPage />
                </Can>
              } />
              <Route path="reports/cashier-history" element={
                <Can perform="view:reports">
                  <CashierHistoryPage />
                </Can>
              } />
              <Route path="reports/driver-settlement/:sessionId" element={
                <Can perform="view:reports">
                  <DriverSettlementReportPage />
                </Can>
              } />
               <Route path="reports/product-profitability" element={
                <Can perform="view:reports">
                  <ProductProfitabilityReportPage />
                </Can>
              } />
              <Route path="reports/ingredient-consumption" element={
                <Can perform="view:reports">
                  <IngredientConsumptionReportPage />
                </Can>
              } />
              <Route path="reports/waste" element={
                <Can perform="view:reports">
                  <WasteReportPage />
                </Can>
              } />

              {/* Settings */}
              <Route path="settings" element={
                <Can perform="manage:settings">
                  <TenantSettingsPage />
                </Can>
              } />

              {/* Fallback Redirect */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
};

export default App;