import React from 'react';
import { Card, Typography, Button, List, Tag, Space } from 'antd';
import { Order, OrderStatus } from '../../types/order';
import { ClockCircleOutlined, CheckOutlined, ArrowRightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

dayjs.extend(relativeTime);
dayjs.locale('es');

interface OrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
}

const statusActions: Partial<Record<OrderStatus, { nextStatus: OrderStatus; buttonText: string; icon: React.ReactNode }>> = {
  confirmed: {
    nextStatus: 'in_preparation',
    buttonText: 'Empezar Preparación',
    icon: <ArrowRightOutlined />,
  },
  in_preparation: {
    nextStatus: 'ready_for_delivery',
    buttonText: 'Marcar como Listo',
    icon: <CheckOutlined />,
  },
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusUpdate }) => {
  const action = statusActions[order.status];

  return (
    <Card
      title={`Pedido #${order.id.split('-')[0]}`}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #d9d9d9' }}
      bodyStyle={{ flex: 1, overflowY: 'auto', padding: '16px' }}
      extra={<Tag icon={<ClockCircleOutlined />} color="default">{dayjs(order.createdAt).fromNow(true)}</Tag>}
      actions={action ? [
        <Button
          type="primary"
          icon={action.icon}
          onClick={() => onStatusUpdate(order.id, action.nextStatus)}
        >
          {action.buttonText}
        </Button>
      ] : []}
    >
      <List
        dataSource={order.items}
        renderItem={(item) => (
          <List.Item style={{ padding: '8px 0' }}>
            <List.Item.Meta
              title={<Typography.Text strong>{item.quantity}x {item.product.name}</Typography.Text>}
              description={item.notes ? <Typography.Text type="danger" strong>Nota: {item.notes}</Typography.Text> : null}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default OrderCard;