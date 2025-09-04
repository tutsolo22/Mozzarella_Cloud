import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Breadcrumb,
  Typography,
  MenuProps,
} from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  ExperimentOutlined,
  SettingOutlined,
  CarOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { RoleEnum } from '../types/user';
import Can from '../components/Auth/Can';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Lógica para determinar la clave del menú seleccionada.
  // Por ejemplo, si la ruta es /products/edit/123, queremos que se seleccione /products.
  const pathSnippets = location.pathname.split('/').filter(i => i);
  const selectedMenuKey = pathSnippets.length > 0 ? `/${pathSnippets[0]}` : '/';

  const userMenu: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <div>
          <Text strong>{user?.fullName || 'Usuario'}</Text>
          <br />
          <Text type="secondary">{user?.email}</Text>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      onClick: logout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', color: 'white', lineHeight: '32px', borderRadius: '6px' }}>
          {collapsed ? 'MC' : 'Mozzarella Cloud'}
        </div>
        <Menu theme="dark" selectedKeys={[selectedMenuKey]} mode="inline">
          {/* Menú para todos los roles autenticados */}
          {(user?.role === RoleEnum.Admin || user?.role === RoleEnum.Manager) && (
            <Menu.Item key="/" icon={<DashboardOutlined />}>
              <Link to="/">Dashboard</Link>
            </Menu.Item>
          )}

          {/* Menú para Admin y Manager */}
          {(user?.role === RoleEnum.Admin || user?.role === RoleEnum.Manager) && (
            <>
              <Menu.Item key="/orders" icon={<ShoppingOutlined />}><Link to="/orders">Pedidos</Link></Menu.Item>
              <Menu.Item key="/products" icon={<AppstoreOutlined />}><Link to="/products">Productos</Link></Menu.Item>
              <Menu.Item key="/ingredients" icon={<ExperimentOutlined />}><Link to="/ingredients">Ingredientes</Link></Menu.Item>
              <Menu.Item key="/settings" icon={<SettingOutlined />}><Link to="/settings">Configuración</Link></Menu.Item>
            </>
          )}

          {/* Menú solo para Admin */}
          <Can perform="users:read">
            <Menu.Item key="/users" icon={<TeamOutlined />}>
              <Link to="/users">Usuarios</Link>
            </Menu.Item>
          </Can>

          {/* Menú para Repartidores */}
          {user?.role === RoleEnum.Delivery && (
            <Menu.Item key="/my-deliveries" icon={<CarOutlined />}>
              <Link to="/my-deliveries">Mis Entregas</Link>
            </Menu.Item>
          )}
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Dropdown menu={{ items: userMenu }} trigger={['click']}>
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <Avatar icon={<UserOutlined />} />
                <Text>{user?.fullName || user?.email}</Text>
              </Space>
            </a>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;