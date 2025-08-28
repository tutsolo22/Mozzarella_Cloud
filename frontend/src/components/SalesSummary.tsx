import React, { useState, useEffect } from 'react';
import { Card, Statistic, Table, Spin, Alert, Row, Col } from 'antd';
import { getSalesReport } from '../services/api';
import { ShoppingCartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface SalesSummaryProps {
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null;
  trigger: number;
}

const SalesSummary: React.FC<SalesSummaryProps> = ({ dateRange, trigger }) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!dateRange || !dateRange[0] || !dateRange[1]) return;

      setLoading(true);
      setError(null);
      try {
        const startDate = dateRange[0].format('YYYY-MM-DD');
        const endDate = dateRange[1].format('YYYY-MM-DD');
        const data = await getSalesReport(startDate, endDate);
        setReport(data);
      } catch (err) {
        setError('Error al cargar el reporte de ventas.');
      } finally {
        setLoading(false);
      }
    };

    if (trigger > 0) {
      fetchReport();
    }
  }, [dateRange, trigger]);

  const columns = [
    {
      title: 'Producto',
      dataIndex: 'productName',
      key: 'productName',
      sorter: (a: any, b: any) => a.productName.localeCompare(b.productName),
    },
    {
      title: 'Cantidad Vendida',
      dataIndex: 'quantitySold',
      key: 'quantitySold',
      sorter: (a: any, b: any) => a.quantitySold - b.quantitySold,
    },
    {
      title: 'Ingresos',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (val: number) => `$${val.toFixed(2)}`,
      sorter: (a: any, b: any) => a.totalRevenue - b.totalRevenue,
      defaultSortOrder: 'descend' as const,
    },
  ];

  return (
    <Card title="Resumen de Ventas" loading={loading}>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      {!loading && !error && report && (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic title="Ingresos Totales" value={report.totalRevenue} prefix="$" precision={2} valueStyle={{ color: '#3f8600' }} />
            </Col>
            <Col span={12}>
              <Statistic title="Pedidos Totales" value={report.totalOrders} prefix={<ShoppingCartOutlined />} />
            </Col>
          </Row>
          <Table dataSource={report.productsBreakdown} columns={columns} rowKey="productId" pagination={{ pageSize: 5 }} style={{ marginTop: 24 }} size="small" />
        </>
      )}
      {!loading && !report && !error && <Alert message="Haga clic en 'Generar Reportes' para ver los datos." type="info" showIcon />}
    </Card>
  );
};

export default SalesSummary;