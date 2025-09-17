import React, { useState } from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, Space, theme, MenuProps } from 'antd';
import { Outlet, useLocation, Link, useNavigate, Navigate } from 'react-router-dom';
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
  CrownOutlined,
  SafetyCertificateOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { Can } from '../components/Auth/Can';
import ThemeSwitcher from '../components/layout/ThemeSwitcher';
import LocationSelector from '../components/layout/LocationSelector';

const { Header, Content, Sider } = Layout;
const { Text, Title } = Typography;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    token: { colorBgContainer, colorText },
  } = theme.useToken();

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

  // Lógica mejorada para resaltar el menú y submenú activo
  const pathSnippets = location.pathname.split('/').filter(i => i);
  const openKeys = pathSnippets.length > 1 ? [`/${pathSnippets[0]}`] : [];

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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: '#333333', textAlign: 'center', color: '#DAA520', lineHeight: '32px', borderRadius: '6px', fontWeight: 'bold' }}>
          {collapsed ? 'MC' : 'Mozzarella Cloud'}
        </div>
        <Menu theme="dark" selectedKeys={[location.pathname]} defaultOpenKeys={openKeys} mode="inline">
          {user?.role?.name === 'super_admin' ? (
            <>
              <Menu.Item key="/super-admin/dashboard" icon={<DashboardOutlined />}>
                <Link to="/super-admin/dashboard">Dashboard</Link>
              </Menu.Item>
              <Menu.Item key="/super-admin/tenants" icon={<CrownOutlined />}>
                <Link to="/super-admin/tenants">Gestión de Tenants</Link>
              </Menu.Item>
              <Menu.Item key="/super-admin/licenses" icon={<SafetyCertificateOutlined />}>
                <Link to="/super-admin/licenses">Gestión de Licencias</Link>
              </Menu.Item>
              <Menu.SubMenu key="/super-admin/settings" icon={<SettingOutlined />} title="Configuración">
                <Menu.Item key="/super-admin/smtp-settings" icon={<MailOutlined />}>
                  <Link to="/super-admin/smtp-settings">Correo (SMTP)</Link>
                </Menu.Item>
              </Menu.SubMenu>
            </>
          ) : (
            <>
              <Menu.Item key="/dashboard" icon={<DashboardOutlined />}>
                <Link to="/dashboard">Dashboard</Link>
              </Menu.Item>
              <Can permission="view:kds">
                <Menu.Item key="/kds" icon={<DesktopOutlined />}>
                  <Link to="/kds">KDS</Link>
                </Menu.Item>
              </Can>
              <Can permission="manage:dispatch">
                <Menu.Item key="/dispatch" icon={<CarOutlined />}>
                  <Link to="/dispatch">Despacho</Link>
                </Menu.Item>
              </Can>
              <Menu.SubMenu key="/management" icon={<AppstoreOutlined />} title="Gestión">
                  <Can permission="manage:products">
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
                  <Can permission="manage:users">
                    <Menu.Item key="/management/users" icon={<UserOutlined />}>
                      <Link to="/management/users">Usuarios</Link>
                    </Menu.Item>
                  </Can>
                  <Can permission="manage:locations">
                    <Menu.Item key="/management/locations" icon={<ShopOutlined />}>
                      <Link to="/management/locations">Sucursales</Link>
                    </Menu.Item>
                  </Can>
                  <Can permission="manage:hr">
                    <Menu.Item key="/management/hr" icon={<TeamOutlined />}>
                      <Link to="/management/hr">Recursos Humanos</Link>
                    </Menu.Item>
                  </Can>
              </Menu.SubMenu>
              <Menu.SubMenu key="/financials" icon={<DollarCircleOutlined />} title="Finanzas">
                <Can permission="manage:financials">
                  <Menu.Item key="/financials/overhead-costs">
                    <Link to="/financials/overhead-costs">Costos Operativos</Link>
                  </Menu.Item>
                </Can>
              </Menu.SubMenu>
              <Menu.SubMenu key="/reports" icon={<BarChartOutlined />} title="Reportes">
                <Can permission="view:consolidated_reports">
                  <Menu.Item key="/reports/consolidated-sales">
                    <Link to="/reports/consolidated-sales">Ventas Consolidadas</Link>
                  </Menu.Item>
                </Can>
                <Can permission="view:reports">
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
                <Can permission="manage:cashier_session">
                  <Menu.Item key="/reports/cashier-session">
                    <Link to="/reports/cashier-session">Corte de Caja</Link>
                  </Menu.Item>
                </Can>
                 <Can permission="view:reports">
                  <Menu.Item key="/reports/cashier-history">
                    <Link to="/reports/cashier-history">Historial de Cajas</Link>
                  </Menu.Item>
                </Can>
              </Menu.SubMenu>
              <Menu.Item key="/settings" icon={<SettingOutlined />}>
                <Link to="/settings">Configuración</Link>
              </Menu.Item>
            </>
          )}
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header style={{ padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <Title level={4} style={{ margin: 0, flexShrink: 0 }}>{user?.role?.name === 'super_admin' ? 'Panel Super Admin' : user?.tenant?.name}</Title>
           <Space align="center" size="large">
            {user?.role?.name !== 'super_admin' && (
              <LocationSelector />
            )}
            <ThemeSwitcher />
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
      </Layout>
    </Layout>
  );
};

export default MainLayout;
