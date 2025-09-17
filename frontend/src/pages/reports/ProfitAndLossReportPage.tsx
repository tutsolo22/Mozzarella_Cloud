import React, { useState } from 'react';
import { Card, DatePicker, Button, Spin, Alert, Typography, Row, Col, Statistic, Divider } from 'antd';
import { FileTextOutlined, PieChartOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getProfitAndLossReport } from '../../services/api';
import { ProfitAndLossReport } from '../../types/reports';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

// Colors for the expense chart
const COLORS = ['#FF8042', '#FFBB28', '#00C49F'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
};

const ProfitAndLossReportPage: React.FC = () => {
  const [report, setReport] = useState<ProfitAndLossReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([dayjs().startOf('month'), dayjs()]);

  const handleGenerateReport = async () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      setError('Por favor, selecciona un rango de fechas.');
      return;
    }
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      const data = await getProfitAndLossReport(startDate, endDate);
      setReport(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo generar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  const expenseData = report ? [
    { name: 'Costo de Mercadería', value: report.costOfGoodsSold },
    { name: 'Costo de Mano de Obra', value: report.laborCost },
    { name: 'Gastos Operativos', value: report.overheadCosts },
  ].filter(d => d.value > 0) : [];

  return (
    <Card>
      <Title level={2}><PieChartOutlined /> Reporte de Ganancias y Pérdidas (P&L)</Title>
      <Paragraph>
        Analiza la rentabilidad de tu negocio en un período específico. Este reporte consolida ingresos, costos y gastos para determinar la ganancia neta.
      </Paragraph>

      <Row gutter={16} align="bottom" style={{ marginBottom: 24 }}>
        <Col>
          <Paragraph style={{ marginBottom: 4 }}>Selecciona el período:</Paragraph>
          <RangePicker value={dateRange} onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])} />
        </Col>
        <Col>
          <Button type="primary" onClick={handleGenerateReport} loading={loading} icon={<FileTextOutlined />}>
            Generar Reporte
          </Button>
        </Col>
      </Row>

      {loading && <Spin tip="Generando reporte..." />}
      {error && <Alert message={error} type="error" showIcon />}

      {report && (
        <div>
          <Title level={4}>Resultados para el período: {dayjs(report.period.from).format('DD/MM/YYYY')} - {dayjs(report.period.to).format('DD/MM/YYYY')}</Title>
          <Row gutter={[16, 24]}>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic title="Ingresos Totales" value={formatCurrency(report.totalRevenue)} valueStyle={{ color: '#3f8600' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic title="Costo de Mercadería (COGS)" value={formatCurrency(report.costOfGoodsSold)} valueStyle={{ color: '#cf1322' }} />
              </Card>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Card>
                <Statistic title="Ganancia Bruta" value={formatCurrency(report.grossProfit)} valueStyle={{ color: report.grossProfit >= 0 ? '#3f8600' : '#cf1322' }} />
              </Card>
            </Col>
          </Row>

          <Divider>Gastos Operativos</Divider>

          <Row gutter={[16, 24]} align="middle">
            <Col xs={24} lg={16}>
              <Row gutter={[16, 24]}>
                <Col xs={24} sm={12}>
                  <Card>
                    <Statistic title="Costo de Mano de Obra" value={formatCurrency(report.laborCost)} valueStyle={{ color: '#cf1322' }} />
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card>
                    <Statistic title="Otros Gastos Operativos" value={formatCurrency(report.overheadCosts)} valueStyle={{ color: '#cf1322' }} />
                  </Card>
                </Col>
                <Col xs={24} sm={24}>
                  <Card>
                    <Statistic title="Total de Gastos" value={formatCurrency(report.totalExpenses)} valueStyle={{ color: '#cf1322' }} />
                  </Card>
                </Col>
              </Row>
            </Col>
            <Col xs={24} lg={8}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Col>
          </Row>

          <Divider />

          <Row justify="center" style={{ marginTop: 24 }}>
            <Col>
              <Card style={{ backgroundColor: report.netProfit >= 0 ? '#f6ffed' : '#fff1f0', borderColor: report.netProfit >= 0 ? '#b7eb8f' : '#ffa39e' }}>
                <Statistic
                  title={<Title level={3}>Ganancia Neta (Resultado Final)</Title>}
                  value={formatCurrency(report.netProfit)}
                  valueStyle={{ fontSize: '2.5rem', color: report.netProfit >= 0 ? '#3f8600' : '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </Card>
  );
};

export default ProfitAndLossReportPage;