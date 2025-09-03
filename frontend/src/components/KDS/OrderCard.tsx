import React from 'react';
import { Card, Typography, Button, List, Tag, Space } from 'antd';
import { Order, OrderStatus, DeliveryProviderType } from '../../types/order';
import { ClockCircleOutlined, CheckOutlined, ArrowRightOutlined, CarOutlined, StarFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';
import './OrderCard.css';

dayjs.extend(relativeTime);
dayjs.locale('es');

interface OrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
  isDriverApproaching?: boolean;
  pickupEtaMinutes?: number | null;
}

const statusActions: Partial<Record<OrderStatus, { nextStatus: OrderStatus; buttonText: string; icon: React.ReactNode }>> = {
  confirmed: {
    nextStatus: 'in_preparation',
    buttonText: 'Empezar Preparación',
    icon: <ArrowRightOutlined />,
  },
  in_preparation: {
    nextStatus: OrderStatus.ReadyForDelivery, // Se ajustará dinámicamente abajo
    buttonText: 'Marcar como Listo',
    icon: <CheckOutlined />,
  },
  ready_for_external_pickup: {
    nextStatus: OrderStatus.Delivered,
    buttonText: 'Entregar a Repartidor Externo',
    icon: <CheckOutlined />,
  },
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusUpdate, isDriverApproaching, pickupEtaMinutes }) => {
  const action = statusActions[order.status];

  return (
    <Card
      className={isDriverApproaching ? 'order-card-approaching' : ''}
      title={`Pedido #${order.shortId}`}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, overflowY: 'auto', padding: '16px' }}
      extra={
        <Space>
          {order.deliveryProvider === DeliveryProviderType.External && (
            <Tag color="purple">{order.externalDeliveryProvider || 'Externo'}</Tag>
          )}
          {order.isPriority && <Tag icon={<StarFilled />} color="gold">Prioritario</Tag>}
          {isDriverApproaching && (
            <Tag icon={<CarOutlined />} color="purple">
              {pickupEtaMinutes != null ? `Llega en ~${pickupEtaMinutes} min` : 'Llegando'}
            </Tag>
          )}
          <Tag icon={<ClockCircleOutlined />} color="default">{dayjs(order.createdAt).fromNow(true)}</Tag>
        </Space>
      }
      actions={action ? [
        <Button
          type="primary"
          icon={action.icon}
          onClick={() => {
            let nextStatus = action.nextStatus;
            if (order.status === OrderStatus.InPreparation) {
              nextStatus = order.deliveryProvider === DeliveryProviderType.External ? OrderStatus.ReadyForExternalPickup : OrderStatus.ReadyForDelivery;
            }
            onStatusUpdate(order.id, nextStatus);
          }}
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