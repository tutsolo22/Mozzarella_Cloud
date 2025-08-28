import React, { useState, useEffect } from 'react';
import { Table, Typography, Spin, Alert, Tag } from 'antd';
import { getProductProfitabilityReport } from '../../services/api';

const { Title } = Typography;

interface ProfitabilityData {
  productId: string;
  productName: string;
  sellingPrice: number;
  ingredientsCost: number;
  profit: number;
  margin: number;
}

const ProfitabilityReportPage: React.FC = () => {
  const [reportData, setReportData] = useState<ProfitabilityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await getProductProfitabilityReport();
        setReportData(data);
      } catch (err) {
        setError('No se pudo cargar el reporte de rentabilidad.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const getMarginColor = (margin: number) => {
    if (margin < 25) return 'red';
    if (margin < 50) return 'orange';
    return 'green';
  };

  const columns = [
    {
      title: 'Producto',
      dataIndex: 'productName',
      key: 'productName',
      sorter: (a: ProfitabilityData, b: ProfitabilityData) => a.productName.localeCompare(b.productName),
    },
    {
      title: 'Precio Venta',
      dataIndex: 'sellingPrice',
      key: 'sellingPrice',
      render: (price: number) => `$${price.toFixed(2)}`,
      sorter: (a: ProfitabilityData, b: ProfitabilityData) => a.sellingPrice - b.sellingPrice,
    },
    {
      title: 'Costo Ingredientes',
      dataIndex: 'ingredientsCost',
      key: 'ingredientsCost',
      render: (cost: number) => `$${cost.toFixed(2)}`,
      sorter: (a: ProfitabilityData, b: ProfitabilityData) => a.ingredientsCost - b.ingredientsCost,
    },
    {
      title: 'Ganancia',
      dataIndex: 'profit',
      key: 'profit',
      render: (profit: number) => `$${profit.toFixed(2)}`,
      sorter: (a: ProfitabilityData, b: ProfitabilityData) => a.profit - b.profit,
    },
    {
      title: 'Margen',
      dataIndex: 'margin',
      key: 'margin',
      render: (margin: number) => <Tag color={getMarginColor(margin)}>{margin.toFixed(1)}%</Tag>,
      sorter: (a: ProfitabilityData, b: ProfitabilityData) => a.margin - b.margin,
      defaultSortOrder: 'ascend' as const,
    },
  ];

  if (loading) return <Spin tip="Generando reporte..." size="large" />;
  if (error) return <Alert message={error} type="error" showIcon />;

  return (
    <>
      <Title level={2}>Reporte de Rentabilidad por Producto</Title>
      <Table columns={columns} dataSource={reportData} rowKey="productId" />
    </>
  );
};

export default ProfitabilityReportPage;