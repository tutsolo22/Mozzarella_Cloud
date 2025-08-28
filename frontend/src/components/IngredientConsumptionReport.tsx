import React, { useState, useEffect } from 'react';
import { Card, Table, Spin, Alert } from 'antd';
import { getIngredientConsumptionReport } from '../services/api';
import dayjs from 'dayjs';

interface ConsumptionData {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  totalConsumed: number;
}

interface IngredientConsumptionReportProps {
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null;
  trigger: number;
}

const IngredientConsumptionReport: React.FC<IngredientConsumptionReportProps> = ({ dateRange, trigger }) => {
  const [data, setData] = useState<ConsumptionData[]>([]);
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
        const report = await getIngredientConsumptionReport(startDate, endDate);
        setData(report.consumedIngredients);
      } catch (err) {
        setError('No se pudo generar el reporte de consumo.');
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
      title: 'Ingrediente',
      dataIndex: 'ingredientName',
      key: 'ingredientName',
    },
    {
      title: 'Total Consumido',
      dataIndex: 'totalConsumed',
      key: 'totalConsumed',
      render: (value: number, record: ConsumptionData) => `${parseFloat(value.toFixed(3))} ${record.unit}`,
      sorter: (a: ConsumptionData, b: ConsumptionData) => a.totalConsumed - b.totalConsumed,
      defaultSortOrder: 'descend' as const,
    },
  ];

  return (
    <Card title="Reporte de Consumo de Ingredientes" loading={loading}>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      {!loading && !error && data.length > 0 && (
        <Table
          columns={columns}
          dataSource={data}
          rowKey="ingredientId"
          pagination={{ pageSize: 5 }}
          size="small"
        />
      )}
      {!loading && data.length === 0 && !error && (
        <Alert message="No hay datos de consumo para el período seleccionado." type="info" showIcon />
      )}
    </Card>
  );
};

export default IngredientConsumptionReport;