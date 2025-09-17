import React, { useState } from 'react';
import {
  Card,
  DatePicker,
  Button,
  Spin,
  Alert,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Divider,
  Empty,
} from 'antd';
import { PieChartOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getProfitAndLossReport } from '../../services/api';
import dayjs, { Dayjs } from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ['#0088FE', '#FF8042', '#FFBB28']; // Blue: COGS, Orange: Labor, Yellow: Overhead

const ProfitabilityReportPage: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([dayjs().startOf('month'), dayjs().endOf('month')]);

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
      const data = await getProfitAndLossReport(startDate, endDate);
      setReport(data);
    } catch (err) {
      setError('No se pudo generar el reporte de rentabilidad.');
    } finally {
      setLoading(false);
    }
  };

  const costBreakdownData = report ? [
    { name: 'Costo de Ingredientes', value: report.costOfGoodsSold },
    { name: 'Costo de Mano de Obra', value: report.expenses.laborCost },
    { name: 'Costos Operativos', value: report.expenses.overheadCost },
  ].filter(item => item.value > 0) : [];

  const renderReport = () => {
    if (loading) return <Spin tip="Generando reporte..." />;
    if (!report) return <Empty description="Seleccione un rango de fechas y genere un reporte para ver los resultados." />;

    const isProfit = report.netProfit >= 0;

    return (
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12} lg={6}>
          <Card><Statistic title="Ingresos Totales" value={report.totalRevenue} precision={2} prefix="$" /></Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card><Statistic title="Ganancia Bruta" value={report.grossProfit} precision={2} prefix="$" /></Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card><Statistic title="Gastos Totales" value={report.expenses.totalExpenses} precision={2} prefix="$" /></Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card>
            <Statistic
              title="Ganancia / Pérdida Neta"
              value={report.netProfit}
              precision={2}
              prefix={isProfit ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              valueStyle={{ color: isProfit ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Resumen Financiero">
            <Row gutter={16}>
              <Col span={12}><Statistic title="Costo de Ingredientes (COGS)" value={report.costOfGoodsSold} prefix="$" precision={2} /></Col>
              <Col span={12}><Statistic title="Costo de Mano de Obra" value={report.expenses.laborCost} prefix="$" precision={2} /></Col>
              <Col span={12} style={{marginTop: 16}}><Statistic title="Costos Operativos" value={report.expenses.overheadCost} prefix="$" precision={2} /></Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Desglose de Costos">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={costBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                  {costBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}><PieChartOutlined /> Reporte de Ganancias y Pérdidas</Title>
      <Card>
        <Space>
          <RangePicker value={dateRange} onChange={(dates) => setDateRange(dates as any)} />
          <Button type="primary" onClick={fetchReport} loading={loading}>
            Generar Reporte
          </Button>
        </Space>
        {error && <Alert message={error} type="error" showIcon style={{ marginTop: 16 }} />}
      </Card>
      {renderReport()}
    </div>
  );
};

export default ProfitabilityReportPage;