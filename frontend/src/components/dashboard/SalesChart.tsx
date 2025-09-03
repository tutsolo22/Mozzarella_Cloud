import React from 'react';
import { Line } from '@ant-design/charts';
import { Card, Skeleton } from 'antd';
import { WeeklySale } from '../../types/dashboard';

interface SalesChartProps {
  data: WeeklySale[];
  loading: boolean;
}

const SalesChart: React.FC<SalesChartProps> = ({ data, loading }) => {
  const config = {
    data,
    xField: 'date',
    yField: 'sales',
    height: 300,
    point: { size: 5, shape: 'diamond' },
    tooltip: { showMarkers: false },
    yAxis: { title: { text: 'Ventas ($)' } },
    xAxis: { title: { text: 'Fecha' } },
  };

  return (
    <Card title="Ventas de los Últimos 7 Días">
      <Skeleton loading={loading} active>
        <Line {...config} />
      </Skeleton>
    </Card>
  );
};

export default SalesChart;