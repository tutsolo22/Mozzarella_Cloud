import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, Alert, Typography, Table } from 'antd';
import { UserOutlined, CheckCircleOutlined, ClockCircleOutlined, StopOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { getSuperAdminDashboardStats, SuperAdminStats } from '../../services/api';

const { Title } = Typography;

interface SoonToExpireLicense {
  tenantId: string;
  tenantName: string;
  expiresAt: string;
}

const SuperAdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getSuperAdminDashboardStats();
        setStats(data);
      } catch (err) {
        setError('No se pudieron cargar las estadísticas. Por favor, inténtelo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <Spin tip="Cargando estadísticas..." size="large" style={{ display: 'block', marginTop: 50 }} />;
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  const soonToExpireColumns = [
    {
      title: 'Nombre del Tenant',
      dataIndex: 'tenantName',
      key: 'tenantName',
    },
    {
      title: 'Fecha de Expiración',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date: string) => new Date(date).toLocaleDateString('es-ES'),
    },
  ];

  return (
    <div>
      <Title level={2}>Dashboard de Super Administrador</Title>
      
      <Title level={4} style={{ marginTop: 32 }}>Estadísticas de Tenants</Title>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Total de Tenants" value={stats?.tenants?.total} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Activos" value={stats?.tenants?.active} valueStyle={{ color: '#DAA520' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="En Prueba" value={stats?.tenants?.trial} valueStyle={{ color: '#8B8000' }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Suspendidos" value={stats?.tenants?.suspended} valueStyle={{ color: '#800020' }} prefix={<StopOutlined />} />
          </Card>
        </Col>
      </Row>

      <Title level={4} style={{ marginTop: 32 }}>Estadísticas de Licencias</Title>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Total de Licencias" value={stats?.licenses?.total} prefix={<SafetyCertificateOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Activas" value={stats?.licenses?.active} valueStyle={{ color: '#DAA520' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Expiradas" value={stats?.licenses?.expired} valueStyle={{ color: '#800020' }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Revocadas" value={stats?.licenses?.revoked} valueStyle={{ color: '#800020' }} prefix={<StopOutlined />} />
          </Card>
        </Col>
      </Row>

      {stats && stats.soonToExpire.length > 0 && (
        <>
          <Title level={4} style={{ marginTop: 32 }}>Licencias Próximas a Expirar (30 días)</Title>
          <Table
            columns={soonToExpireColumns}
            dataSource={stats.soonToExpire}
            rowKey="tenantId"
            pagination={false}
          />
        </>
      )}
    </div>
  );
};

export default SuperAdminDashboardPage;