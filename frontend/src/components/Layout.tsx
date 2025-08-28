import React, { useState } from 'react';
import {
  DesktopOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  ContainerOutlined,
  BarChartOutlined,
  ExperimentOutlined,
  PieChartOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout as AntdLayout, Menu, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

const { Header, Content, Footer, Sider } = AntdLayout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems: MenuItem[] = [
    getItem('Dashboard', '/dashboard', <PieChartOutlined />),
    getItem('Punto de Venta', '/pos', <ShoppingCartOutlined />),
    getItem('Pantalla Cocina', '/kds', <ContainerOutlined />),
    getItem('Pedidos', '/orders', <DesktopOutlined />),
    getItem('Productos', '/products', <ShopOutlined />),
    getItem('Reportes', 'sub_reports', <BarChartOutlined />, [
      getItem('Rentabilidad Productos', '/reports/profitability'),
      getItem('Reporte de Mermas', '/reports/waste'),
    ]),
    getItem('Inventario', '/ingredients', <ExperimentOutlined />),
    getItem('Usuarios', '/users', <UserOutlined />),
  ];

  if (user?.role === 'super-admin') {
    menuItems.push(
      getItem('Super Admin', 'sub1', <SafetyCertificateOutlined />, [
        getItem('Dashboard', '/super-admin/dashboard'),
        getItem('Tenants', '/super-admin/tenants'),
      ]),
    );
  }

  return (
    <AntdLayout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          defaultSelectedKeys={[location.pathname]}
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <AntdLayout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Space>
            <NotificationBell />
          </Space>
        </Header>
        <Content style={{ margin: '0 16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#fff', marginTop: 24 }}>
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Mozzarella Cloud ©2024</Footer>
      </AntdLayout>
    </AntdLayout>
  );
};

export default Layout;