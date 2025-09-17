import React, { useState } from 'react';
import { DatePicker, Button, Spin, Typography, Card, Row, Col, Table, Alert, Statistic } from 'antd';
import { getConsolidatedSalesReport } from '../../services/reports';
import dayjs from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AreaChartOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const ConsolidatedSalesReportPage: React.FC = () => {
  const [dates, setDates] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    if (!dates || !dates[0] || !dates[1]) {
      setError('Por favor, selecciona un rango de fechas.');
      return;
    }

    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      const params = {
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
      };
      const data = await getConsolidatedSalesReport(params);
      setReportData(data);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al generar el reporte consolidado.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Sucursal', dataIndex: 'locationName', key: 'locationName' },
    { title: 'Total Pedidos', dataIndex: 'totalOrders', key: 'totalOrders', align: 'right' as const, sorter: (a: any, b: any) => a.totalOrders - b.totalOrders },
    { title: 'Ingresos Totales', dataIndex: 'totalRevenue', key: 'totalRevenue', align: 'right' as const, render: (val: number) => `$${val.toFixed(2)}`, sorter: (a: any, b: any) => a.totalRevenue - b.totalRevenue, defaultSortOrder: 'descend' as const },
  ];

  return (
    <Card>
      <Title level={2}><AreaChartOutlined /> Reporte de Ventas Consolidado</Title>
      <Typography.Paragraph>
        Este reporte muestra un resumen de las ventas de todas tus sucursales en el periodo seleccionado.
      </Typography.Paragraph>
      <Row gutter={16} align="bottom" style={{ marginBottom: 24 }}>
        <Col>
          <Text>Rango de Fechas</Text><br />
          <RangePicker onChange={(values) => setDates(values)} />
        </Col>
        <Col>
          <Button type="primary" onClick={handleGenerateReport} loading={loading}>
            Generar Reporte
          </Button>
        </Col>
      </Row>

      {error && <Alert message={error} type="error" showIcon style={{ marginTop: 16 }} />}
      {loading && <Spin style={{ marginTop: 24, display: 'block' }} />}

      {reportData && (
        <div>
          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col xs={24} sm={8}><Card><Statistic title="Ingresos Totales" value={reportData.grandTotalRevenue} prefix="$" precision={2} /></Card></Col>
            <Col xs={24} sm={8}><Card><Statistic title="Total Pedidos" value={reportData.grandTotalOrders} /></Card></Col>
            <Col xs={24} sm={8}><Card><Statistic title="Sucursales Activas" value={reportData.locationsCount} /></Card></Col>
          </Row>

          <Title level={4} style={{ marginTop: 32 }}>Tendencia de Ventas Diarias</Title>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.salesTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(tick) => dayjs(tick).format('DD/MM')}
              />
              <YAxis />
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ingresos']} />
              <Legend />
              <Line type="monotone" dataKey="dailyRevenue" stroke="#82ca9d" name="Ingresos Diarios" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>

          <Title level={4} style={{ marginTop: 32 }}>Comparativa de Ventas por Sucursal</Title>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.salesByLocation} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="locationName" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="totalRevenue" fill="#8884d8" name="Ingresos" />
            </BarChart>
          </ResponsiveContainer>

          <Title level={4} style={{ marginTop: 32 }}>Desglose por Sucursal</Title>
          <Table
            dataSource={reportData.salesByLocation}
            columns={columns}
            rowKey="locationId"
            pagination={false}
          />
        </div>
      )}
    </Card>
  );
};

export default ConsolidatedSalesReportPage;