import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert, Typography, Table, Tag } from 'antd';
import { TeamOutlined, CheckCircleOutlined, StopOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/charts';
import { getSuperAdminDashboardStats } from '../../services/api';

const { Title } = Typography;

interface Stats {
  tenants: {
    total: number;
    active?: number;
    suspended?: number;
    trial?: number;
  };
  licenses: {
    total: number;
    active?: number;
    expired?: number;
    revoked?: number;
  };
  soonToExpire: {
    tenantId: string;
    tenantName: string;
    expiresAt: string;
  }[];
}

const SuperAdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getSuperAdminDashboardStats();
        setStats(data);
      } catch (err) {
        setError('No se pudieron cargar las estadísticas del dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <Spin tip="Cargando estadísticas..." size="large" style={{ display: 'block', marginTop: 50 }} />;
  if (error) return <Alert message={error} type="error" showIcon />;
  if (!stats) return <Alert message="No hay datos para mostrar." type="info" showIcon />;

  const { tenants, licenses, soonToExpire } = stats;

  const tenantStatusData = [
    { type: 'Activos', value: tenants.active || 0 },
    { type: 'Suspendidos', value: tenants.suspended || 0 },
    { type: 'En Prueba', value: tenants.trial || 0 },
  ].filter(d => d.value > 0);

  const licenseStatusData = [
    { type: 'Activas', value: licenses.active || 0 },
    { type: 'Expiradas', value: licenses.expired || 0 },
    { type: 'Revocadas', value: licenses.revoked || 0 },
  ].filter(d => d.value > 0);

  const pieConfig = {
    appendPadding: 10,
    angleField: 'value',
    colorField: 'type',
    radius: 0.85,
    innerRadius: 0.6,
    legend: {
      position: 'top' as const,
    },
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value}',
      style: {
        textAlign: 'center',
        fontSize: 14,
        fill: '#fff',
      },
    },
    interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
    statistic: null as any,
  };

  const soonToExpireColumns = [
    {
      title: 'Restaurante',
      dataIndex: 'tenantName',
      key: 'tenantName',
    },
    {
      title: 'Expira en',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date: string) => {
        const expires = new Date(date);
        const now = new Date();
        const diffTime = expires.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return <Tag color={diffDays < 7 ? 'red' : 'orange'}>{diffDays} días ({expires.toLocaleDateString('es-ES')})</Tag>;
      },
    },
  ];

  return (
    <div>
      <Title level={2}>Dashboard de Super Administrador</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Total de Tenants"
              value={tenants.total}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Tenants Activos"
              value={tenants.active || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Tenants Suspendidos"
              value={tenants.suspended || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<StopOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Licencias Activas"
              value={licenses.active || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<SafetyCertificateOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={8}>
          <Card title="Distribución de Tenants">
            {tenantStatusData.length > 0 ? <Pie {...pieConfig} data={tenantStatusData} /> : <Alert message="No hay datos de tenants para mostrar." type="info" />}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Distribución de Licencias">
            {licenseStatusData.length > 0 ? <Pie {...pieConfig} data={licenseStatusData} /> : <Alert message="No hay datos de licencias para mostrar." type="info" />}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Licencias a punto de expirar (próximos 30 días)">
            <Table
              columns={soonToExpireColumns}
              dataSource={soonToExpire}
              rowKey="tenantId"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SuperAdminDashboardPage;