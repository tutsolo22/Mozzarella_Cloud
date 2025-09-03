import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography,
  Spin,
  Alert,
  Card,
  Descriptions,
  Collapse,
  Table,
  Tag,
  Button,
  Row,
  Col,
  Statistic,
  Empty,
} from 'antd';
import { CarOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { getDriverSettlementReport } from '../../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const DriverSettlementReportPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No se ha proporcionado un ID de sesión.');
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await getDriverSettlementReport(sessionId);
        setReport(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'No se pudo cargar el reporte de corte por repartidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [sessionId]);

  const orderColumns = [
    { title: 'Pedido #', dataIndex: 'shortId', key: 'shortId' },
    {
      title: 'Monto',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val: number) => `$${val.toFixed(2)}`,
    },
    {
      title: 'Método Pago',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => <Tag color={method === 'cash' ? 'green' : 'blue'}>{method}</Tag>,
    },
    {
      title: 'Hora Entrega',
      dataIndex: 'deliveredAt',
      key: 'deliveredAt',
      render: (date: string) => dayjs(date).format('HH:mm:ss'),
    },
  ];

  if (loading) return <Spin tip="Generando reporte..." />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;
  if (!report) return null;

  return (
    <div style={{ padding: 24 }}>
      <Link to="/reports/cashier-history">
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
          Volver al Historial
        </Button>
      </Link>
      <Card>
        <Title level={2}><CarOutlined /> Corte por Repartidor</Title>
        <Descriptions bordered>
          <Descriptions.Item label="ID de Sesión">{report.sessionInfo.id}</Descriptions.Item>
          <Descriptions.Item label="Cerrada por">{report.sessionInfo.closedBy}</Descriptions.Item>
          <Descriptions.Item label="Periodo">{`${dayjs(report.sessionInfo.period.from).format('DD/MM/YYYY HH:mm')} - ${dayjs(report.sessionInfo.period.to).format('HH:mm')}`}</Descriptions.Item>
        </Descriptions>
      </Card>

      {report.settlementData.length === 0 ? (
        <Empty description="No hay entregas registradas para esta sesión." style={{ marginTop: 24 }} />
      ) : (
        <Collapse accordion style={{ marginTop: 24 }}>
          {report.settlementData.map((driverData: any) => (
            <Panel
              header={
                <Row justify="space-between" align="middle" style={{ width: '100%' }}>
                  <Col><Text strong>{driverData.driverName}</Text></Col>
                  <Col><Tag color="gold">{driverData.orders.length} entregas</Tag></Col>
                </Row>
              }
              key={driverData.driverId}
              extra={
                <Statistic
                  title="Efectivo a entregar"
                  value={driverData.cashCollected}
                  prefix="$"
                  precision={2}
                  valueStyle={{ fontSize: '1.2em', color: '#1890ff' }}
                />
              }
            >
              <Table columns={orderColumns} dataSource={driverData.orders} rowKey="shortId" pagination={false} size="small" />
            </Panel>
          ))}
        </Collapse>
      )}
    </div>
  );
};

export default DriverSettlementReportPage;