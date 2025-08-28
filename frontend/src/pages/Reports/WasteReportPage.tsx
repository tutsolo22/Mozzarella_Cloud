import React, { useState } from 'react';
import { Card, DatePicker, Button, Table, Spin, Alert, Typography, Space, Row, Col, Statistic } from 'antd';
import { getWasteReport } from '../../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const WasteReportPage: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const fetchReport = async () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      setError('Por favor, seleccione un rango de fechas.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      const data = await getWasteReport(startDate, endDate);
      setReport(data);
    } catch (err) {
      setError('No se pudo generar el reporte de mermas.');
    } finally {
      setLoading(false);
    }
  };

  const ingredientNameMap = report ? new Map(report.summary.map((s: any) => [s.ingredientId, s.ingredientName])) : new Map();
  const unitMap = report ? new Map(report.summary.map((s: any) => [s.ingredientId, s.unit])) : new Map();

  const summaryColumns = [
    { title: 'Ingrediente', dataIndex: 'ingredientName', key: 'ingredientName', sorter: (a: any, b: any) => a.ingredientName.localeCompare(b.ingredientName) },
    { title: 'Cantidad Total Desperdiciada', dataIndex: 'totalQuantity', key: 'totalQuantity', render: (val: number, record: any) => `${val.toFixed(3)} ${record.unit}`, sorter: (a: any, b: any) => a.totalQuantity - b.totalQuantity, defaultSortOrder: 'descend' as const },
    { title: 'Nº de Registros', dataIndex: 'entries', key: 'entries', sorter: (a: any, b: any) => a.entries - b.entries },
  ];

  const detailColumns = [
    { title: 'Fecha', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => new Date(date).toLocaleString('es-ES'), sorter: (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(), defaultSortOrder: 'descend' as const },
    { title: 'Ingrediente', dataIndex: 'ingredientId', key: 'ingredientName', render: (id: string) => ingredientNameMap.get(id) || id },
    { title: 'Cantidad', dataIndex: 'quantityChange', key: 'quantityChange', render: (val: string, record: any) => `${Math.abs(parseFloat(val))} ${unitMap.get(record.ingredientId) || ''}` },
    { title: 'Motivo', dataIndex: 'reason', key: 'reason' },
  ];

  return (
    <>
      <Title level={2}>Reporte de Mermas de Ingredientes</Title>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <RangePicker onChange={(dates) => setDateRange(dates as any)} />
            <Button type="primary" onClick={fetchReport} loading={loading}>
              Generar Reporte
            </Button>
          </Space>
          {error && <Alert message={error} type="error" showIcon />}
          {loading ? (
            <Spin tip="Generando reporte..." />
          ) : (
            report && (
              <Row gutter={[16, 24]} style={{ marginTop: 24 }}>
                <Col span={24}>
                  <Statistic title="Total de Registros de Merma" value={report.totalWasteEntries} />
                </Col>
                <Col span={24}>
                  <Title level={4}>Resumen por Ingrediente</Title>
                  <Table columns={summaryColumns} dataSource={report.summary} rowKey="ingredientId" size="small" pagination={{ pageSize: 5 }} />
                </Col>
                <Col span={24}>
                  <Title level={4}>Detalle de Mermas</Title>
                  <Table columns={detailColumns} dataSource={report.details} rowKey="id" size="small" pagination={{ pageSize: 10 }} />
                </Col>
              </Row>
            )
          )}
        </Space>
      </Card>
    </>
  );
};

export default WasteReportPage;