import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, message, Skeleton, Card } from 'antd';
import { DollarCircleOutlined, ShoppingCartOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getDashboardStats } from '../../services/reports';
import { DashboardStats } from '../../types/dashboard';
import StatCard from '../../components/dashboard/StatCard';
import SalesChart from '../../components/dashboard/SalesChart';
import OrderStatusPieChart from '../../components/dashboard/OrderStatusPieChart';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        message.error('Error al cargar las estadísticas del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <Title level={2} style={{ marginBottom: '24px' }}>Dashboard</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="Ventas de Hoy" value={stats?.todaySales ?? 0} prefix="$" icon={<DollarCircleOutlined />} loading={loading} />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="Pedidos de Hoy" value={stats?.todayOrders ?? 0} icon={<ShoppingCartOutlined />} loading={loading} />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="Pedidos Pendientes" value={stats?.pendingOrders ?? 0} icon={<ClockCircleOutlined />} loading={loading} />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="Pedidos Listos" value={stats?.readyOrders ?? 0} icon={<CheckCircleOutlined />} loading={loading} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={16}>
          <SalesChart data={stats?.weeklySales ?? []} loading={loading} />
        </Col>
        <Col xs={24} lg={8}>
          {loading ? (
            <Card>
              <Skeleton active />
            </Card>
          ) : (
            <OrderStatusPieChart data={stats?.statusCounts ?? []} loading={loading} />
          )}
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;