import React from 'react';
import { Menu } from 'antd';
import {
  DashboardOutlined,
  FireOutlined,
  TruckOutlined,
  SettingOutlined,
  DollarCircleOutlined,
  BarChartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const AppMenu: React.FC = () => {
  const location = useLocation();

  // Helper to find the open key for submenus
  const getOpenKeys = () => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    if (pathSnippets.length > 0) {
      return [`/${pathSnippets[0]}`];
    }
    return [];
  };

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
    { key: '/kds', icon: <FireOutlined />, label: <Link to="/kds">Cocina (KDS)</Link> },
    { key: '/dispatch', icon: <TruckOutlined />, label: <Link to="/dispatch">Despacho</Link> },
    {
      key: '/management',
      label: 'Gestión',
      icon: <SettingOutlined />,
      children: [
        { key: '/management/products', label: <Link to="/management/products">Productos</Link> },
        { key: '/management/product-categories', label: <Link to="/management/product-categories">Categorías</Link> },
        { key: '/management/ingredients', label: <Link to="/management/ingredients">Ingredientes</Link> },
        { key: '/management/promotions', label: <Link to="/management/promotions">Promociones</Link> },
        { key: '/management/users', label: <Link to="/management/users">Usuarios</Link> },
        { key: '/management/locations', label: <Link to="/management/locations">Sucursales</Link> },
        { key: '/management/hr', label: <Link to="/management/hr">Personal</Link> },
        { key: '/management/preparation-zones', label: <Link to="/management/preparation-zones">Zonas de Preparación</Link> },
      ]
    },
    {
      key: '/financials',
      label: 'Finanzas',
      icon: <DollarCircleOutlined />,
      children: [
        { key: '/financials/overhead-costs', label: <Link to="/financials/overhead-costs">Costos Fijos</Link> },
      ]
    },
    {
      key: '/reports',
      label: 'Reportes',
      icon: <BarChartOutlined />,
      children: [
        { key: '/reports/pnl', label: <Link to="/reports/pnl">Ganancias y Pérdidas</Link> },
        { key: '/reports/consolidated-sales', label: <Link to="/reports/consolidated-sales">Ventas Consolidadas</Link> },
        { key: '/reports/sales', label: <Link to="/reports/sales">Ventas</Link> },
        { key: '/reports/driver-performance', label: <Link to="/reports/driver-performance">Rendimiento Repartidores</Link> },
        { key: '/reports/cashier-session', label: <Link to="/reports/cashier-session">Sesión de Caja</Link> },
        { key: '/reports/cashier-history', label: <Link to="/reports/cashier-history">Historial de Cajas</Link> },
        { key: '/reports/product-profitability', label: <Link to="/reports/product-profitability">Rentabilidad</Link> },
        { key: '/reports/ingredient-consumption', label: <Link to="/reports/ingredient-consumption">Consumo Ingredientes</Link> },
        { key: '/reports/waste', label: <Link to="/reports/waste">Mermas</Link> },
      ]
    },
    { key: '/settings', icon: <UserOutlined />, label: <Link to="/settings">Configuración</Link> },
  ];

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      defaultOpenKeys={getOpenKeys()}
      items={menuItems}
    />
  );
};

export default AppMenu;