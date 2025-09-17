import React, { useState } from 'react';
import { Card, DatePicker, Button, Table, Spin, Alert, Typography, Space, Row, Col } from 'antd';
import { getWasteReport } from '../../services/reports';
import dayjs from 'dayjs';
import { useLocationContext } from '../../contexts/LocationContext';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const WasteReportPage: React.FC = () => {
  const { selectedLocationId, loading: locationLoading } = useLocationContext();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const handleGenerateReport = async () => {
    if (!selectedLocationId) {
      setError('Por favor, selecciona una sucursal.');
      return;
    }
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      setError('Por favor, seleccione un rango de fechas.');
      return;
    }
    setError(null);
    setLoading(true);
    setReport(null);

    try {
      const params = {
        locationId: selectedLocationId,
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
      };
      const data = await getWasteReport(params);
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'No se pudo generar el reporte de mermas.');
    } finally {
      setLoading(false);
    }
  };

  const summaryColumns = [
    { title: 'Ingrediente', dataIndex: 'ingredientName', key: 'ingredientName', sorter: (a: any, b: any) => a.ingredientName.localeCompare(b.ingredientName) },
    { title: 'Cantidad Total Desperdiciada', dataIndex: 'totalQuantity', key: 'totalQuantity', render: (val: number, record: any) => `${val.toFixed(3)} ${record.unit}`, sorter: (a: any, b: any) => a.totalQuantity - b.totalQuantity, defaultSortOrder: 'descend' as const },
    { title: 'Nº de Registros', dataIndex: 'entries', key: 'entries', sorter: (a: any, b: any) => a.entries - b.entries },
  ];

  const detailColumns = [
    { title: 'Fecha', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => new Date(date).toLocaleString('es-ES'), sorter: (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(), defaultSortOrder: 'descend' as const },
    { title: 'Ingrediente', dataIndex: ['ingredient', 'name'], key: 'ingredientName' },
    { title: 'Cantidad', dataIndex: 'quantityChange', key: 'quantityChange', render: (val: string, record: any) => `${Math.abs(parseFloat(val))} ${record.ingredient.unit}` },
    { title: 'Motivo', dataIndex: 'reason', key: 'reason' },
  ];

  return (
    <Card>
      <Title level={2}>Reporte de Mermas de Ingredientes</Title>
      <Row gutter={16} align="bottom" style={{ marginBottom: 24 }}>
        <Col>
          <Text>Rango de Fechas</Text><br />
          <RangePicker onChange={(values) => setDateRange(values as any)} />
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

      {report && (
        <Row gutter={[16, 24]} style={{ marginTop: 24 }}>
          <Col span={24}>
            <Title level={4}>Resumen por Ingrediente</Title>
            <Table columns={summaryColumns} dataSource={report.summary} rowKey="ingredientId" size="small" pagination={{ pageSize: 5 }} />
          </Col>
          <Col span={24}>
            <Title level={4}>Detalle de Mermas</Title>
            <Table columns={detailColumns} dataSource={report.details} rowKey="id" size="small" pagination={{ pageSize: 10 }} />
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default WasteReportPage;