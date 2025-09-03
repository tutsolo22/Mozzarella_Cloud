import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Col, Row, Spin, Alert, Typography, notification } from 'antd';
import { getOrdersByStatus, updateOrderStatus, getTenantConfiguration } from '../../services/api';
import { Order, OrderStatus } from '../../types/order';
import OrderCard from '../../components/KDS/OrderCard';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import { CarOutlined, StarFilled } from '@ant-design/icons';
import { TenantConfiguration } from '../../types/tenant';

const { Title } = Typography;

const KDSPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approachingOrders, setApproachingOrders] = useState<Map<string, { etaMinutes: number | null }>>(new Map());
  const audioRef = useRef<HTMLAudioElement>(null);
  const [tenantConfig, setTenantConfig] = useState<TenantConfiguration | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const statusesToFetch = [OrderStatus.Confirmed, OrderStatus.InPreparation, OrderStatus.ReadyForExternalPickup];
        const [initialOrders, config] = await Promise.all([getOrdersByStatus(statusesToFetch), getTenantConfiguration()]);
        setOrders(initialOrders);
        setTenantConfig(config);
      } catch (err) {
        setError('No se pudieron cargar los pedidos.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('access_token');
    const socket: Socket = io('http://localhost:3001', { auth: { token: `Bearer ${token}` } });

    socket.on('new_order_to_kitchen', (newOrder: Order) => {
      setOrders(prev => [newOrder, ...prev]);
    });

    socket.on('order_status_update', (updatedOrder: Order) => {
      if (updatedOrder.status === OrderStatus.ReadyForDelivery) {
        setOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
      } else {
        setOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
      }
    });

    socket.on('order_priority_updated', (updatedOrder: Order) => {
      setOrders(prev =>
        prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o))
      );
      if (updatedOrder.isPriority) {
        notification.info({
          message: 'Pedido Priorizado',
          description: `El pedido #${updatedOrder.shortId} ha sido marcado como prioritario.`,
          icon: <StarFilled style={{ color: '#faad14' }} />,
        });
      }
    });

    socket.on('driver_approaching_for_pickup', (data: { order: Order, etaMinutes: number | null }) => {
      const { order, etaMinutes } = data;
      notification.info({
        message: 'Repartidor Cercano',
        description: `El repartidor para el pedido #${order.shortId} está llegando. ${etaMinutes ? `ETA: ~${etaMinutes} min.` : ''}`,
        icon: <CarOutlined />,
      });
      // Reproducir sonido de notificación
      audioRef.current?.play().catch(error => {
        // Los navegadores pueden bloquear la reproducción automática hasta la primera interacción del usuario.
        console.warn("La reproducción de audio falló. Esto puede suceder si el usuario aún no ha interactuado con la página.", error);
      });
      setApproachingOrders(prev => {
        const newMap = new Map(prev);
        newMap.set(order.id, { etaMinutes });
        return newMap;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // La actualización del estado se manejará a través del evento de WebSocket
    } catch (err) {
      notification.error({ message: 'Error al actualizar el pedido' });
    }
  };

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const aIsApproaching = approachingOrders.has(a.id);
      const bIsApproaching = approachingOrders.has(b.id);

      if (aIsApproaching && !bIsApproaching) {
        return -1; // a viene primero
      }
      if (!aIsApproaching && bIsApproaching) {
        return 1; // b viene primero
      }
      // Si ambos son iguales, se ordena por fecha de creación (el más antiguo primero)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [orders, approachingOrders]);

  if (loading) return <Spin tip="Cargando pedidos de cocina..." />;
  if (error) return <Alert message="Error" description={error} type="error" />;

  return (
    <div style={{ padding: '16px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <audio
        ref={audioRef}
        src={tenantConfig?.kdsNotificationSoundUrl || "/sounds/notification.mp3"}
        preload="auto"
      />
      <Title level={2}>KDS - Sistema de Despacho en Cocina</Title>
      <Row gutter={[16, 16]}>
        {sortedOrders.map(order => (
          <Col key={order.id} xs={24} sm={12} md={8} lg={6}>
            <OrderCard
              order={order}
              onStatusUpdate={handleStatusUpdate}
              isDriverApproaching={approachingOrders.has(order.id)}
              pickupEtaMinutes={approachingOrders.get(order.id)?.etaMinutes}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default KDSPage;