import React, { useState } from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, Space, Select, Spin, theme, MenuProps } from 'antd';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AppstoreOutlined,
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
} from '@ant-design/icons';
import { Can } from '../components/Auth/Can';
import { LocationProvider, useLocationContext } from '../contexts/LocationContext';
import ThemeSwitcher from '../components/Theme/ThemeSwitcher';

const { Header, Content, Sider } = Layout;
const { Text, Title } = Typography;

const LocationSelector: React.FC = () => {
  const { user } = useAuth();
  const { locations, selectedLocationId, selectLocation, loading } = useLocationContext();

  // Only show selector for Admins who have locations
  if (user?.role !== 'admin' || locations.length === 0) {
    return null;
  }

  if (loading) {
    return <Spin size="small" />;
  }

  return (
    <Space>
      <Text style={{ flexShrink: 0 }}>Sucursal:</Text>
      <Select
        value={selectedLocationId}
        onChange={(value) => selectLocation(value)}
        style={{ width: 200 }}
        placeholder="Seleccionar sucursal"
      >
        {locations.map(loc => <Select.Option key={loc.id} value={loc.id}>{loc.name}</Select.Option>)}
      </Select>
    </Space>
  );
};

const AppContent: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const {
    token: { colorBgContainer, colorText },
  } = theme.useToken();

  // Lógica mejorada para resaltar el menú y submenú activo
  const pathSnippets = location.pathname.split('/').filter(i => i);
  const openKeys = pathSnippets.length > 1 ? [`/${pathSnippets[0]}`] : [];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: <Link to="/profile">Mi Perfil</Link>,
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Cerrar Sesión',
      icon: <LogoutOutlined />,
      onClick: logout,
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', color: 'white', lineHeight: '32px', borderRadius: '6px' }}>
          {collapsed ? 'MC' : 'Mozzarella Cloud'}
        </div>
        <Menu theme="dark" selectedKeys={[location.pathname]} defaultOpenKeys={openKeys} mode="inline">
          <Menu.Item key="/dashboard" icon={<DashboardOutlined />}>
            <Link to="/dashboard">Dashboard</Link>
          </Menu.Item>
          <Can perform="view:kds">
            <Menu.Item key="/kds" icon={<DesktopOutlined />}>
              <Link to="/kds">KDS</Link>
            </Menu.Item>
          </Can>
          <Can perform="manage:dispatch">
            <Menu.Item key="/dispatch" icon={<CarOutlined />}>
              <Link to="/dispatch">Despacho</Link>
            </Menu.Item>
          </Can>
          <Menu.SubMenu key="management" icon={<AppstoreOutlined />} title="Gestión">
              <Can perform="manage:products">
                <Menu.Item key="/management/products" icon={<GiftOutlined />}>
                  <Link to="/management/products">Productos</Link>
                </Menu.Item>
                <Menu.Item key="/management/product-categories" icon={<AppstoreOutlined />}>
                  <Link to="/management/product-categories">Categorías</Link>
                </Menu.Item>
                <Menu.Item key="/management/promotions" icon={<TagsOutlined />}>
                  <Link to="/management/promotions">Promociones</Link>
                </Menu.Item>
                <Menu.Item key="/management/preparation-zones" icon={<BuildOutlined />}>
                  <Link to="/management/preparation-zones">Zonas de Preparación</Link>
                </Menu.Item>
              </Can>
              <Can perform="manage:users">
                <Menu.Item key="/management/users" icon={<UserOutlined />}>
                  <Link to="/management/users">Usuarios</Link>
                </Menu.Item>
              </Can>
              <Can perform="manage:locations">
                <Menu.Item key="/management/locations" icon={<ShopOutlined />}>
                  <Link to="/management/locations">Sucursales</Link>
                </Menu.Item>
              </Can>
              <Can perform="manage:hr">
                <Menu.Item key="/management/hr" icon={<TeamOutlined />}>
                  <Link to="/management/hr">Recursos Humanos</Link>
                </Menu.Item>
              </Can>
          </Menu.SubMenu>
          <Menu.SubMenu key="financials" icon={<DollarCircleOutlined />} title="Finanzas">
            <Can perform="manage:financials">
              <Menu.Item key="/financials/overhead-costs">
                <Link to="/financials/overhead-costs">Costos Operativos</Link>
              </Menu.Item>
            </Can>
          </Menu.SubMenu>
          <Menu.SubMenu key="reports" icon={<BarChartOutlined />} title="Reportes">
            <Can perform="view:reports">
              {user?.role === 'admin' && (
                <Menu.Item key="/reports/consolidated-sales">
                  <Link to="/reports/consolidated-sales">Ventas Consolidadas</Link>
                </Menu.Item>
              )}
              <Menu.Item key="/reports/sales">
                <Link to="/reports/sales">Ventas</Link>
              </Menu.Item>
              <Menu.Item key="/reports/product-profitability">
                <Link to="/reports/product-profitability">Rentabilidad de Productos</Link>
              </Menu.Item>
              <Menu.Item key="/reports/ingredient-consumption">
                <Link to="/reports/ingredient-consumption">Consumo de Ingredientes</Link>
              </Menu.Item>
              <Menu.Item key="/reports/waste">
                <Link to="/reports/waste">Mermas</Link>
              </Menu.Item>
              <Menu.Item key="/reports/driver-performance">
                <Link to="/reports/driver-performance">Rendimiento de Repartidores</Link>
              </Menu.Item>
            </Can>
            <Can perform="manage:cashier_session">
              <Menu.Item key="/reports/cashier-session">
                <Link to="/reports/cashier-session">Corte de Caja</Link>
              </Menu.Item>
            </Can>
             <Can perform="view:reports">
              <Menu.Item key="/reports/cashier-history">
                <Link to="/reports/cashier-history">Historial de Cajas</Link>
              </Menu.Item>
            </Can>
          </Menu.SubMenu>
          <Menu.Item key="/settings" icon={<SettingOutlined />}>
            <Link to="/settings">Configuración</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <Title level={4} style={{ margin: 0, flexShrink: 0 }}>{user?.tenant?.name || 'Mi Negocio'}</Title>
           <Space align="center" size="large">
            <LocationSelector />
            <ThemeSwitcher />
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
              <a onClick={e => e.preventDefault()} style={{cursor: 'pointer'}}>
                <Space>
                  <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
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
      </Layout>
    </Layout>
  );
};

const MainLayout: React.FC = () => {
  return (
    <LocationProvider>
      <AppContent />
    </LocationProvider>
  );
};

export default MainLayout;
