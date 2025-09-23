import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, Space, theme, MenuProps, Button } from 'antd';
import { Outlet, useLocation, Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AppstoreOutlined,
  QuestionCircleOutlined,
  DashboardOutlined,
  DesktopOutlined,
  CarOutlined,
  GiftOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  ShopOutlined,
  TeamOutlined,
  DollarCircleOutlined,
  TagsOutlined,
  BuildOutlined,
  FireOutlined,
  CrownOutlined,
  SolutionOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  MailOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import ThemeSwitcher from '../components/layout/ThemeSwitcher';
import LocationSelector from '../components/layout/LocationSelector';
import { useTour } from '../contexts/TourContext';
import OnboardingTour from '../components/tour/OnboardingTour';

const { Header, Content, Sider } = Layout;
const { Text, Title } = Typography;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  const { isTourRunning, startTour, stepIndex } = useTour();
  const {
    token: { colorBgContainer, colorText },
  } = theme.useToken();

  // Lógica mejorada para resaltar el menú y submenú activo
  const pathSnippets = location.pathname.split('/').filter(i => i);
  const defaultOpenKeys = pathSnippets.length > 1 ? [`/${pathSnippets[0]}`] : [];

  // Añadimos una condición para mantener abierto el submenú de Configuración
  if (location.pathname.startsWith('/settings') || location.pathname === '/management/preparation-zones') {
    defaultOpenKeys.push('settings-submenu');
  }

  const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys);

  // Este efecto se encarga de abrir los submenús correctos durante el tour
  useEffect(() => {
    if (isTourRunning) {
      if (stepIndex === 0) setOpenKeys(['settings-submenu']); // Abre Configuración para el primer paso
      else if (stepIndex >= 1 && stepIndex <= 5) setOpenKeys(['/management']); // Abre Gestión para los siguientes
      else setOpenKeys([]); // Cierra todos los menús para el último paso
    }
  }, [isTourRunning, stepIndex]);

  // --- Lógica de Redirección y Renderizado ---
  // Si hay un usuario logueado, decidimos qué renderizar o a dónde redirigir.
  if (user) {
    // 1. Si es Super Admin y no está en su área, redirigirlo.
    if (user.role?.name === 'super_admin' && !location.pathname.startsWith('/super-admin')) {
      return <Navigate to="/super-admin/dashboard" replace />;
    }
    // 2. Si es un usuario normal en la página de login/raíz, redirigirlo.
    if (user.role?.name !== 'super_admin' && (location.pathname === '/login' || location.pathname === '/')) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const onOpenChange = (keys: string[]) => {
    // Permitir al usuario controlar el menú solo cuando el tour no está activo
    if (!isTourRunning) {
      setOpenKeys(keys);
    }
  }
  
  const userMenuItems: MenuProps['items'] =
    user?.role?.name === 'super_admin'
      ? [
          {
            key: 'logout',
            label: 'Cerrar Sesión',
            icon: <LogoutOutlined />,
            onClick: handleLogout,
            danger: true,
          },
        ]
      : [
          {
            key: 'profile',
            label: <Link to="/profile">Mi Perfil</Link>,
            icon: <UserOutlined />,
          },
          { type: 'divider' },
          { key: 'logout', label: 'Cerrar Sesión', icon: <LogoutOutlined />, onClick: handleLogout, danger: true },
        ];

  const getMenuItems = (): MenuProps['items'] => {
    if (!user) return [];

    if (user.role?.name === 'super_admin') {
      return [
        { key: '/super-admin/dashboard', icon: <DashboardOutlined />, label: <Link to="/super-admin/dashboard">Dashboard</Link> },
        { key: '/super-admin/tenants', icon: <CrownOutlined />, label: <Link to="/super-admin/tenants">Gestión de Tenants</Link> },
        { key: '/super-admin/licenses', icon: <SafetyCertificateOutlined />, label: <Link to="/super-admin/licenses">Gestión de Licencias</Link> },
        { key: '/super-admin/logs', icon: <FileTextOutlined />, label: <Link to="/super-admin/logs">Visor de Logs</Link> },
        {
          key: '/super-admin/settings',
          icon: <SettingOutlined />,
          label: 'Configuración',
          children: [
            { key: '/super-admin/smtp-settings', icon: <MailOutlined />, label: <Link to="/super-admin/smtp-settings">Correo (SMTP)</Link> },
          ],
        },
      ];
    }

    // Construye el menú del tenant dinámicamente basado en los permisos
    const tenantMenuItems = [
      { key: '/dashboard', icon: <DashboardOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
      {
        key: '/operations',
        icon: <DesktopOutlined />,
        label: 'Operaciones',
        children: [
          hasPermission('view:kds') && { key: '/kds', label: <Link to="/kds">KDS (Cocina)</Link> },
          hasPermission('manage:dispatch') && { key: '/dispatch', icon: <CarOutlined />, label: <Link to="/dispatch">Despacho</Link> },
        ].filter(Boolean),
      },
      {
        key: '/management',
        icon: <AppstoreOutlined />,
        label: 'Gestión',
        children: [
          hasPermission('manage:products') && { key: '/management/products', icon: <GiftOutlined />, label: <Link to="/management/products">Productos</Link>, 'data-tour': 'menu-products' },
          hasPermission('manage:product_categories') && { key: '/management/product-categories', icon: <AppstoreOutlined />, label: <Link to="/management/product-categories">Categorías</Link>, 'data-tour': 'menu-product-categories' },
          hasPermission('manage:promotions') && { key: '/management/promotions', icon: <TagsOutlined />, label: <Link to="/management/promotions">Promociones</Link> },
          hasPermission('manage:users') && { key: '/management/users', icon: <UserOutlined />, label: <Link to="/management/users">Usuarios</Link> },
          hasPermission('manage:locations') && { key: '/management/locations', icon: <ShopOutlined />, label: <Link to="/management/locations">Sucursales</Link>, 'data-tour': 'menu-locations' },
          hasPermission('manage:hr') && { key: '/management/hr', icon: <TeamOutlined />, label: <Link to="/management/hr">Recursos Humanos</Link>, 'data-tour': 'menu-hr' },
        ].filter(Boolean),
      },
      {
        key: '/financials',
        icon: <DollarCircleOutlined />,
        label: 'Finanzas',
        children: [
          hasPermission('manage:financials') && { key: '/financials/overhead-costs', label: <Link to="/financials/overhead-costs">Costos Operativos</Link> },
          hasPermission('manage:cashier_session') && { key: '/reports/cashier-session', label: <Link to="/reports/cashier-session">Corte de Caja</Link> },
          hasPermission('view:reports') && { key: '/reports/cashier-history', label: <Link to="/reports/cashier-history">Historial de Cajas</Link> },
        ].filter(Boolean),
      },
      {
        key: '/reports',
        icon: <BarChartOutlined />,
        label: 'Reportes',
        children: [
          hasPermission('view:consolidated_reports') && { key: '/reports/consolidated-sales', label: <Link to="/reports/consolidated-sales">Ventas Consolidadas</Link> },
          hasPermission('view:reports') && { key: '/reports/pnl', label: <Link to="/reports/pnl">Ganancias y Pérdidas</Link> },
          hasPermission('view:reports') && { key: '/reports/sales', label: <Link to="/reports/sales">Ventas</Link> },
          hasPermission('view:reports') && { key: '/reports/product-profitability', label: <Link to="/reports/product-profitability">Rentabilidad de Productos</Link> },
          hasPermission('view:reports') && { key: '/reports/ingredient-consumption', label: <Link to="/reports/ingredient-consumption">Consumo de Ingredientes</Link> },
          hasPermission('view:reports') && { key: '/reports/waste', label: <Link to="/reports/waste">Mermas</Link> },
          hasPermission('view:reports') && { key: '/reports/driver-performance', label: <Link to="/reports/driver-performance">Rendimiento de Repartidores</Link> },
        ].filter(Boolean),
      },
      {
        key: 'settings-submenu',
        icon: <SettingOutlined />,
        label: 'Configuración',
        'data-tour': 'menu-settings',
        children: [
          hasPermission('manage:settings') && { key: '/settings', label: <Link to="/settings">General</Link> },
          hasPermission('manage:locations') && { key: '/management/preparation-zones', icon: <FireOutlined />, label: <Link to="/management/preparation-zones">Zonas de Preparación</Link> },
        ].filter(Boolean),
      },
    ];

    // Filtra los submenús que se quedaron sin hijos visibles
    return tenantMenuItems.filter(item => !item.children || item.children.length > 0);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: '#333333', textAlign: 'center', color: '#DAA520', lineHeight: '32px', borderRadius: '6px', fontWeight: 'bold' }}>
          {collapsed ? 'MC' : 'Mozzarella Cloud'}
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          mode="inline"
          items={getMenuItems()} />
      </Sider>
      <Layout className="site-layout">
        <Header style={{ padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <Title level={4} style={{ margin: 0, flexShrink: 0 }}>{user?.role?.name === 'super_admin' ? 'Panel Super Admin' : user?.tenant?.name}</Title>
           <Space align="center" size="large">
            {user?.role?.name !== 'super_admin' && (
              <LocationSelector />
            )}
            <ThemeSwitcher />
            {user?.role?.name !== 'super_admin' && (
              <Button
                icon={<QuestionCircleOutlined />}
                onClick={startTour}
                title="Iniciar tour de primeros pasos"
              />
            )}
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
              <a onClick={e => e.preventDefault()} style={{cursor: 'pointer'}}>
                <Space>
                  <Avatar style={{ backgroundColor: '#DAA520' }} icon={<UserOutlined />} />
                  <Text style={{ color: colorText }}>{user?.fullName}</Text>
                </Space>
              </a>
            </Dropdown>
           </Space>
        </Header>
        <Content style={{ margin: '0 16px' }}>
          <div style={{ margin: '16px 0' }}>
            {/* Breadcrumb can go here if needed */}
          </div>
          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer, borderRadius: '8px' }}>
            <Outlet />
          </div>
        </Content>
        <OnboardingTour />
      </Layout>
    </Layout>
  );
};

export default MainLayout;
