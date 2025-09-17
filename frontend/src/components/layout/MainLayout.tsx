import React, { useState } from 'react';
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
  ShopOutlined,
  SettingOutlined,
  MoneyCollectOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Breadcrumb, Layout, Menu, Switch, Space, Avatar, Dropdown } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const { Header, Content, Footer, Sider } = Layout;

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

const items: MenuItem[] = [
  getItem(<Link to="/">Dashboard</Link>, '/', <PieChartOutlined />),
  getItem('Punto de Venta', '/pos', <ShoppingCartOutlined />),
  getItem('KDS', '/kds', <DesktopOutlined />),
  getItem('Gestión', 'sub1', <ShopOutlined />, [
    getItem(<Link to="/products">Productos</Link>, '/products'),
    getItem(<Link to="/product-categories">Categorías</Link>, '/product-categories'),
    getItem(<Link to="/ingredients">Ingredientes</Link>, '/ingredients'),
    getItem(<Link to="/preparation-zones">Zonas de Preparación</Link>, '/preparation-zones'),
  ]),
  getItem('Reportes', 'sub2', <BarChartOutlined />, [
    getItem(<Link to="/reports/pnl">Ganancias y Pérdidas</Link>, '/reports/pnl'),
    // ... otros reportes irían aquí
  ]),
  getItem('Recursos Humanos', 'sub3', <TeamOutlined />, [
    getItem(<Link to="/hr/employees">Empleados</Link>, '/hr/employees'),
    getItem(<Link to="/hr/positions">Puestos</Link>, '/hr/positions'),
  ]),
  getItem('Finanzas', 'sub4', <MoneyCollectOutlined />, [
    getItem(<Link to="/financials/overhead-costs">Costos Operativos</Link>, '/financials/overhead-costs'),
    getItem(<Link to="/financials/cashier-session">Caja</Link>, '/financials/cashier-session'),
  ]),
  getItem(<Link to="/settings">Configuración</Link>, '/settings', <SettingOutlined />),
];


const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" onClick={logout}>
        Cerrar Sesión
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', color: 'white', textAlign: 'center', lineHeight: '32px', fontWeight: 'bold' }}>
          MC
        </div>
        <Menu theme="dark" defaultSelectedKeys={[location.pathname]} mode="inline" items={items} />
      </Sider>
      <Layout className="site-layout">
        <Header style={{ padding: '0 16px', background: theme === 'dark' ? '#001529' : '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>{/* Left side empty for now */}</div>
            <Space>
                <Switch checked={theme === 'dark'} onChange={toggleTheme} checkedChildren="Dark" unCheckedChildren="Light" />
                <Dropdown overlay={userMenu}>
                    <a onClick={e => e.preventDefault()}>
                        <Space>
                            <Avatar icon={<UserOutlined />} />
                            {user?.fullName}
                        </Space>
                    </a>
                </Dropdown>
            </Space>
        </Header>
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            {/* La lógica del Breadcrumb puede ir aquí */}
          </Breadcrumb>
          <div style={{ padding: 24, minHeight: 360, background: theme === 'dark' ? '#141414' : '#fff' }}>
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Mozzarella Cloud ©2024</Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;