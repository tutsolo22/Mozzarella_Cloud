import React from 'react';
import { Pie } from '@ant-design/charts';
import { Card, Skeleton } from 'antd';
import { StatusCount } from '../../types/dashboard';
import { OrderStatus } from '../../types/order';

interface OrderStatusPieChartProps {
  data: StatusCount[];
  loading: boolean;
}

const statusLabels: Record<string, string> = {
  [OrderStatus.PendingConfirmation]: 'Pendiente',
  [OrderStatus.Confirmed]: 'Confirmado',
  [OrderStatus.InPreparation]: 'En Preparación',
  [OrderStatus.ReadyForDelivery]: 'Listo para Reparto',
  [OrderStatus.InDelivery]: 'En Reparto',
  [OrderStatus.Delivered]: 'Entregado',
  [OrderStatus.Cancelled]: 'Cancelado',
};

const OrderStatusPieChart: React.FC<OrderStatusPieChartProps> = ({ data, loading }) => {
  const chartData = data.map(item => ({ ...item, status: statusLabels[item.status] || item.status }));

  const config = {
    data: chartData,
    angleField: 'count',
    colorField: 'status',
    radius: 0.8,
    label: { type: 'inner', content: '{percentage}' },
    interactions: [{ type: 'element-active' }],
  };

  return (
    <Card title="Distribución de Pedidos por Estado">
      <Skeleton loading={loading} active>
        <Pie {...config} height={300} />
      </Skeleton>
    </Card>
  );
};

export default OrderStatusPieChart;