import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ConfigProvider, Spin, Layout, theme as antdTheme, App as AntApp } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LocationProvider } from './contexts/LocationContext';
import MainLayout from './layouts/MainLayout';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const LoginPage = lazy(() => import('./pages/login/LoginPage'));
const SetupAccountPage = lazy(() => import('./pages/auth/SetupAccountPage'));
const RequestPasswordResetPage = lazy(() => import('./pages/auth/RequestPasswordResetPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const ActivationSuccessPage = lazy(() => import('./pages/auth/ActivationSuccessPage'));
const ActivationFailurePage = lazy(() => import('./pages/auth/ActivationFailurePage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const KdsPage = lazy(() => import('./pages/kds/KdsPage'));
const DispatchPage = lazy(() => import('./pages/dispatch/DispatchPage'));
const ProductManagementPage = lazy(() => import('./pages/products/ProductManagementPage'));
const ProductCategoryManagementPage = lazy(() => import('./pages/products/ProductCategoryManagementPage'));
const PromotionsManagementPage = lazy(() => import('./pages/management/PromotionsManagementPage'));
const PreparationZonesPage = lazy(() => import('./pages/configuration/PreparationZonesPage'));
const UserManagementPage = lazy(() => import('./pages/users/UserManagementPage'));
const LocationManagementPage = lazy(() => import('./pages/management/LocationsManagementPage'));
const HrManagementPage = lazy(() => import('./pages/hr/HrManagementPage'));
const OverheadCostsPage = lazy(() => import('./pages/financials/OverheadCostsPage'));
const ConsolidatedSalesReportPage = lazy(() => import('./pages/reports/ConsolidatedSalesReportPage'));
const SalesReportPage = lazy(() => import('./pages/reports/SalesReportPage'));
const ProductProfitabilityReportPage = lazy(() => import('./pages/reports/ProductProfitabilityReportPage'));
const IngredientConsumptionReportPage = lazy(() => import('./pages/reports/IngredientConsumptionReportPage'));
const WasteReportPage = lazy(() => import('./pages/reports/WasteReportPage'));
const DriverPerformanceReportPage = lazy(() => import('./pages/reports/DriverPerformanceReportPage'));
const CashierSessionPage = lazy(() => import('./pages/reports/CashierSessionPage'));
const CashierHistoryPage = lazy(() => import('./pages/reports/CashierHistoryPage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const ProfitAndLossReportPage = lazy(() => import('./pages/reports/ProfitAndLossReportPage'));

// Super Admin Pages
const SuperAdminDashboardPage = lazy(() => import('./pages/superadmin/SuperAdminDashboardPage'));
const TenantManagementPage = lazy(() => import('./pages/superadmin/TenantManagementPage'));
const LicenseManagementPage = lazy(() => import('./pages/superadmin/LicenseManagementPage'));
const SmtpSettingsPage = lazy(() => import('./pages/superadmin/SmtpSettingsPage'));
const LogViewerPage = lazy(() => import('./pages/superadmin/LogsViewerPage'));

const CenteredSpinner: React.FC = () => (
  <Layout style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
    <Spin size="large" />
  </Layout>
);

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <CenteredSpinner />;
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) {
    return <CenteredSpinner />;
  }

  if (isAuthenticated) {
    // If authenticated, redirect from public pages to the appropriate dashboard
    const targetPath = user?.role.name === 'super_admin' ? '/super-admin/dashboard' : '/dashboard';
    return <Navigate to={targetPath} replace />;
  }

  return <Outlet />;
};

const ProtectedLayout: React.FC = () => {
  const { user } = useAuth();

  // Super Admin has its own layout logic within MainLayout and doesn't need LocationProvider
  if (user?.role.name === 'super_admin') {
    return <MainLayout />;
  }

  // Tenant users need the LocationProvider context
  return (
    <LocationProvider>
      <MainLayout />
    </LocationProvider>
  );
};

const AppRoutes: React.FC = () => (
  <Suspense fallback={<CenteredSpinner />}>
    <Routes>
      {/* Public routes that redirect if user is already logged in */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>
      <Route path="/setup-account" element={<SetupAccountPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/activation-success" element={<ActivationSuccessPage />} />
      <Route path="/activation-failure" element={<ActivationFailurePage />} />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<ProtectedLayout />}>
          {/* Tenant User Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/kds" element={<KdsPage />} />
          <Route path="/dispatch" element={<DispatchPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/management/products" element={<ProductManagementPage />} />
          <Route path="/management/product-categories" element={<ProductCategoryManagementPage />} />
          <Route path="/management/promotions" element={<PromotionsManagementPage />} />
          <Route path="/management/preparation-zones" element={<PreparationZonesPage />} />
          <Route path="/management/users" element={<UserManagementPage />} />
          <Route path="/management/locations" element={<LocationManagementPage />} />
          <Route path="/management/hr" element={<HrManagementPage />} />
          <Route path="/financials/overhead-costs" element={<OverheadCostsPage />} />
          <Route path="/reports/pnl" element={<ProfitAndLossReportPage />} />
          <Route path="/reports/consolidated-sales" element={<ConsolidatedSalesReportPage />} />
          <Route path="/reports/sales" element={<SalesReportPage />} />
          <Route path="/reports/product-profitability" element={<ProductProfitabilityReportPage />} />
          <Route path="/reports/ingredient-consumption" element={<IngredientConsumptionReportPage />} />
          <Route path="/reports/waste" element={<WasteReportPage />} />
          <Route path="/reports/driver-performance" element={<DriverPerformanceReportPage />} />
          <Route path="/reports/cashier-session" element={<CashierSessionPage />} />
          <Route path="/reports/cashier-history" element={<CashierHistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Super Admin Routes */}
          <Route path="super-admin">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboardPage />} />
            <Route path="tenants" element={<TenantManagementPage />} />
            <Route path="licenses" element={<LicenseManagementPage />} />
            <Route path="smtp-settings" element={<SmtpSettingsPage />} />
            <Route path="logs" element={<LogViewerPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback for any other route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

const ThemedApp: React.FC = () => {
  const { theme } = useTheme();
  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          // Brand Colors
          colorPrimary: '#DAA520', // Gold
          colorInfo: '#DAA520',
          colorSuccess: '#8B8000', // Olive,
          colorWarning: '#800020', // Bordeaux
          colorError: '#800020',

          // Apply to backgrounds
          colorBgLayout: theme === 'dark' ? '#333333' : '#F5F5DC', // Dark Gray for dark layout, Cream for light
          colorBgContainer: theme === 'dark' ? '#262626' : '#FFFFFF', // Lighter gray for dark, white for light
        },
        components: {
          Layout: {
            siderBg: '#000000', // Sider always black
            headerBg: theme === 'dark' ? '#333333' : '#F5F5DC',
          },
          Menu: {
            darkItemSelectedBg: '#333333',
            darkItemHoverColor: '#DAA520',
          }
        }
      }}
    >
      <AntApp>
        <AppRoutes />
      </AntApp>
    </ConfigProvider>
  );
};

const App: React.FC = () => (
  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ThemeProvider>
      <AuthProvider>
        <ThemedApp />
      </AuthProvider>
    </ThemeProvider>
  </Router>
);

export default App;