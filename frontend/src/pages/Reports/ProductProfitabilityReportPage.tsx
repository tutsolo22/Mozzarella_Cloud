import React, { useState, useEffect } from 'react';
import { Table, Typography, Spin, Alert, Card, Button, Tag } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { getProductProfitabilityReport } from '../../services/reports';
import { useLocationContext } from '../../contexts/LocationContext';

const { Title } = Typography;

const ProductProfitabilityReportPage: React.FC = () => {
  const { selectedLocationId, loading: locationLoading } = useLocationContext();
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Automatically fetch report when a location is selected
    if (selectedLocationId) {
      handleGenerateReport();
    } else {
      setReportData([]); // Clear data if no location is selected
    }
  }, [selectedLocationId]);

  const handleGenerateReport = async () => {
    if (!selectedLocationId) {
      setError('Por favor, selecciona una sucursal.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getProductProfitabilityReport({ locationId: selectedLocationId });
      setReportData(data);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al generar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Producto', dataIndex: 'productName', key: 'productName', sorter: (a: any, b: any) => a.productName.localeCompare(b.productName) },
    { title: 'Precio Venta', dataIndex: 'sellingPrice', key: 'sellingPrice', align: 'right' as const, render: (val: number) => `$${val.toFixed(2)}`, sorter: (a: any, b: any) => a.sellingPrice - b.sellingPrice },
    { title: 'Costo Ingredientes', dataIndex: 'ingredientsCost', key: 'ingredientsCost', align: 'right' as const, render: (val: number) => `$${val.toFixed(2)}`, sorter: (a: any, b: any) => a.ingredientsCost - b.ingredientsCost },
    { title: 'Ganancia', dataIndex: 'profit', key: 'profit', align: 'right' as const, render: (val: number) => `$${val.toFixed(2)}`, sorter: (a: any, b: any) => a.profit - b.profit, defaultSortOrder: 'descend' as const },
    { title: 'Margen', dataIndex: 'margin', key: 'margin', align: 'right' as const, render: (val: number) => <Tag color={val > 20 ? 'green' : val > 10 ? 'orange' : 'red'}>{val.toFixed(2)}%</Tag>, sorter: (a: any, b: any) => a.margin - b.margin },
  ];

  return (
    <Card>
      <Title level={2}><BarChartOutlined /> Reporte de Rentabilidad por Producto</Title>
      <Typography.Paragraph>
        Este reporte analiza el costo de los ingredientes de cada producto con receta definida y lo compara con su precio de venta para calcular la ganancia y el margen.
      </Typography.Paragraph>
      
      <Button
        type="primary"
        onClick={handleGenerateReport}
        loading={loading || locationLoading}
        disabled={!selectedLocationId}
        style={{ marginBottom: 24 }}
      >
        Actualizar Reporte
      </Button>

      {error && <Alert message={error} type="error" showIcon style={{ marginTop: 16 }} />}
      
      {!selectedLocationId && !locationLoading && (
        <Alert message="Por favor selecciona una sucursal para generar un reporte." type="info" showIcon style={{ marginTop: 16 }} />
      )}

      {loading ? <Spin style={{ marginTop: 24, display: 'block' }} /> : reportData.length > 0 && (
        <Table dataSource={reportData} columns={columns} rowKey="productId" pagination={{ pageSize: 15 }} />
      )}
    </Card>
  );
};

export default ProductProfitabilityReportPage;