import React, { useState } from 'react';
import { Table, Typography, Spin, Alert, DatePicker, Card, Row, Col, Statistic, Button } from 'antd';
import { CarOutlined, ClockCircleOutlined, DollarCircleOutlined } from '@ant-design/icons';
import { getDriverPerformanceReport } from '../../services/reports';
import { DriverPerformanceData } from '../../types/reports';
import dayjs, { Dayjs } from 'dayjs';
import { useLocationContext } from '../../contexts/LocationContext';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const DriverPerformanceReportPage: React.FC = () => {
  const { selectedLocationId, loading: locationLoading } = useLocationContext();
  const [reportData, setReportData] = useState<DriverPerformanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const handleGenerateReport = async () => {
    if (!selectedLocationId) {
      setError('Por favor, selecciona una sucursal.');
      return;
    }
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      setError('Por favor, selecciona un rango de fechas.');
      return;
    }

    setLoading(true);
    setError(null);
    setReportData([]);

    try {
      const params = {
        locationId: selectedLocationId,
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
      };
      const data = await getDriverPerformanceReport(params);
      setReportData(data);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al generar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Repartidor',
      dataIndex: 'driverName',
      key: 'driverName',
      sorter: (a: DriverPerformanceData, b: DriverPerformanceData) => a.driverName.localeCompare(b.driverName),
    },
    {
      title: 'Total de Entregas',
      dataIndex: 'totalDeliveries',
      key: 'totalDeliveries',
      sorter: (a: DriverPerformanceData, b: DriverPerformanceData) => a.totalDeliveries - b.totalDeliveries,
      render: (value: number) => <Statistic value={value} prefix={<CarOutlined />} valueStyle={{ fontSize: '1rem' }} />,
    },
    {
      title: 'Monto Recaudado',
      dataIndex: 'totalAmountCollected',
      key: 'totalAmountCollected',
      sorter: (a: DriverPerformanceData, b: DriverPerformanceData) => a.totalAmountCollected - b.totalAmountCollected,
      render: (value: number) => <Statistic value={value} precision={2} prefix={<DollarCircleOutlined />} valueStyle={{ fontSize: '1rem' }} />,
    },
    {
      title: 'Tiempo Promedio de Entrega (min)',
      dataIndex: 'averageDeliveryTimeMinutes',
      key: 'averageDeliveryTimeMinutes',
      sorter: (a: DriverPerformanceData, b: DriverPerformanceData) => Number(a.averageDeliveryTimeMinutes) - Number(b.averageDeliveryTimeMinutes),
      render: (value: string | null) => value ? <Statistic value={value} precision={2} prefix={<ClockCircleOutlined />} valueStyle={{ fontSize: '1rem' }} /> : 'N/A',
    },
  ];

  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  return (
    <Card>
      <Title level={2}><CarOutlined /> Reporte de Rendimiento de Repartidores</Title>
      <Row gutter={16} align="bottom" style={{ marginBottom: 24 }}>
        <Col>
          <Typography.Text>Rango de Fechas</Typography.Text><br />
          <RangePicker onChange={(dates) => setDateRange(dates as any)} />
        </Col>
        <Col>
          <Button type="primary" onClick={handleGenerateReport} loading={loading || locationLoading} disabled={!selectedLocationId}>
            Generar Reporte
          </Button>
        </Col>
      </Row>

      {error && <Alert message={error} type="error" showIcon style={{ marginTop: 16 }} />}

      {!selectedLocationId && !locationLoading && (
        <Alert message="Por favor selecciona una sucursal para generar un reporte." type="info" showIcon style={{ marginTop: 16 }} />
      )}

      {loading && <Spin style={{ marginTop: 24, display: 'block' }} />}

      {reportData.length > 0 && (
        <Table
          dataSource={reportData}
          columns={columns}
          rowKey="driverId"
          pagination={{ pageSize: 10 }}
        />
      )}
    </Card>
  );
};

export default DriverPerformanceReportPage;