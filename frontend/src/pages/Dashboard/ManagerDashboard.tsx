import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, message } from 'antd';
import { DollarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import { getManagerDashboardMetrics } from '../../services/reports';
import { ManagerDashboardMetrics } from '../../types/dashboard';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ManagerDashboard: React.FC = () => {
  const [data, setData] = useState<ManagerDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const metrics = await getManagerDashboardMetrics();
        setData(metrics);
      } catch (error) {
        message.error('Error al cargar las métricas del dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }} />;
  }

  if (!data) {
    return <Text>No se pudieron cargar los datos.</Text>;
  }

  const salesChartConfig = {
    data: data.weeklySales,
    xField: 'date',
    yField: 'sales',
    xAxis: {
      tickCount: 7,
      label: { formatter: (v: string) => dayjs(v).format('ddd DD') },
    },
    yAxis: { label: { formatter: (v: number) => `$${v.toLocaleString()}` } },
    tooltip: { formatter: (datum: any) => ({ name: 'Ventas', value: `$${datum.sales.toLocaleString()}` }) },
    smooth: true,
  };

  return (
    <div>
      <Title level={2}>Dashboard de la Sucursal</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Ventas de Hoy"
              value={data.todaySales}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Pedidos de Hoy"
              value={data.todayOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Estado de Pedidos de Hoy">
            <Row>
              <Col span={6} style={{ textAlign: 'center' }}><Statistic title="Confirmados" value={data.statusCounts.confirmed} /></Col>
              <Col span={6} style={{ textAlign: 'center' }}><Statistic title="En Cocina" value={data.statusCounts.in_preparation} /></Col>
              <Col span={6} style={{ textAlign: 'center' }}><Statistic title="En Reparto" value={data.statusCounts.in_delivery} /></Col>
              <Col span={6} style={{ textAlign: 'center' }}><Statistic title="Entregados" value={data.statusCounts.delivered} /></Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Tendencia de Ventas (Últimos 7 días)"><Line {...salesChartConfig} /></Card>
        </Col>
      </Row>
    </div>
  );
};

export default ManagerDashboard;