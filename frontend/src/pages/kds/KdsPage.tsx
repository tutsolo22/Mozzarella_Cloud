import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Tabs, Spin, Alert, Typography, Row, Col, Card, Tag, Button, notification } from 'antd';
import { getPreparationZones, getKdsOrders, updateOrderStatus, getTenantConfiguration } from '../../services/api';
import { PreparationZone } from '../../types/preparation-zone';
import { Order, OrderStatus } from '../../types/order'; // Asegúrate de que OrderStatus incluya ReadyForDelivery
import { TenantConfiguration } from '../../types/tenant';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';
import { CarOutlined, StarFilled } from '@ant-design/icons';

dayjs.extend(relativeTime);
dayjs.locale('es');

const { Title } = Typography;
const { TabPane } = Tabs;

// Reusable Order Card Component
const KdsOrderCard: React.FC<{
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  activeZone: string;
  isApproaching: boolean;
  etaMinutes: number | null;
}> = ({ order, onStatusChange, activeZone, isApproaching, etaMinutes }) => {
  const handleConfirm = () => onStatusChange(order.id, OrderStatus.InPreparation);
  const handleReady = () => onStatusChange(order.id, OrderStatus.ReadyForDelivery);

  const cardStyle: React.CSSProperties = {
    marginBottom: 16,
    borderLeft: '5px solid #DAA520', // Default gold
  };

  if (order.isPriority) {
    cardStyle.borderLeftColor = 'red';
  }
  if (isApproaching) {
    cardStyle.animation = 'pulse-border 2s infinite';
  }

  return (
    <Card title={`Pedido #${order.shortId}`} bordered={false} style={cardStyle}>
      {isApproaching && (
        <Tag icon={<CarOutlined />} color="processing">
          Repartidor llegando {etaMinutes ? `(~${etaMinutes} min)` : ''}
        </Tag>
      )}
      {order.isPriority && !isApproaching && (
        <Tag icon={<StarFilled />} color="error">
          Prioritario
        </Tag>
      )}
      <p><strong>Cliente:</strong> {order.customer?.fullName || 'N/A'}</p>
      <p><strong>Tipo:</strong> {order.orderType}</p>
      <p><strong>Recibido:</strong> {dayjs(order.createdAt).fromNow()}</p>
      <ul>
        {order.items.map(item => {
          const isItemInZone = activeZone === 'all' || item.product.preparationZone?.id === activeZone;
          const style = isItemInZone && activeZone !== 'all' ? { fontWeight: 'bold', color: '#DAA520' } : {};
          return (
            <li key={item.id} style={style}>
              {item.quantity}x {item.product.name}
              {item.product.preparationZone && <Tag style={{ marginLeft: 8 }}>{item.product.preparationZone.name}</Tag>}
            </li>
          );
        })}
      </ul>
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        {order.status === OrderStatus.PendingConfirmation && (
          <Button type="primary" onClick={handleConfirm}>Confirmar</Button>
        )}
        {order.status === OrderStatus.InPreparation && (
          <Button type="primary" onClick={handleReady}>Listo para Despacho</Button>
        )}
        {order.status === OrderStatus.ReadyForExternalPickup && (
          <Tag color="success">Esperando repartidor externo</Tag>
        )}
      </div>
    </Card>
  );
};

// Main KDS Page Component
const KdsPage: React.FC = () => {
  const [zones, setZones] = useState<PreparationZone[]>([]);
  const [activeZone, setActiveZone] = useState<string>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approachingOrders, setApproachingOrders] = useState<Map<string, { etaMinutes: number | null }>>(new Map());
  const [tenantConfig, setTenantConfig] = useState<TenantConfiguration | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user } = useAuth();

  const fetchInitialData = useCallback(async (zoneId: string) => {
    setLoading(true);
    try {
      const zoneToFetch = zoneId === 'all' ? undefined : zoneId;
      const [zonesData, ordersData, configData] = await Promise.all([
        getPreparationZones(),
        getKdsOrders(zoneToFetch),
        getTenantConfiguration(),
      ]);
      setZones(zonesData);
      setOrders(ordersData);
      setTenantConfig(configData);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudieron cargar los datos iniciales.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData(activeZone);
  }, [activeZone, fetchInitialData]);

  useEffect(() => {
    if (!user?.locationId) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const socket: Socket = io(import.meta.env.VITE_API_BASE_URL, {
      auth: { token },
      query: { locationId: user.locationId },
    });

    socket.on('connect', () => console.log('KDS conectado al servidor de WebSockets.'));

    socket.on('new_order_to_kitchen', (newOrder: Order) => {
      const isInZone = activeZone === 'all' || newOrder.items.some(item => item.product.preparationZone?.id === activeZone);
      if (isInZone) {
        setOrders(prev => [...prev, newOrder]);
        notification.info({ message: `Nuevo pedido #${newOrder.shortId}` });
      }
    });

    socket.on('order_status_update', (updatedOrder: Order) => {
      const isFinished = ![OrderStatus.PendingConfirmation, OrderStatus.InPreparation, OrderStatus.ReadyForExternalPickup].includes(updatedOrder.status);
      if (isFinished) {
        setOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
      } else {
        setOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
      }
    });

    socket.on('order_priority_updated', (updatedOrder: Order) => {
      setOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
      if (updatedOrder.isPriority) {
        notification.warning({
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
      audioRef.current?.play().catch(console.warn);
      setApproachingOrders(prev => new Map(prev).set(order.id, { etaMinutes }));
    });

    socket.on('connect_error', (err: Error) => {
      console.error('Error de conexión con WebSocket:', err.message);
      setError('No se pudo conectar al servicio de actualizaciones en tiempo real.');
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.locationId, activeZone]);

  const handleTabChange = (key: string) => {
    setActiveZone(key);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // La actualización del estado se manejará a través del evento de WebSocket
    } catch (err: any) {
      notification.error({ message: 'Error al actualizar el pedido' });
    }
  };

  const sortOrders = (ordersToSort: Order[]) => {
    return [...ordersToSort].sort((a, b) => {
      const aIsApproaching = approachingOrders.has(a.id);
      const bIsApproaching = approachingOrders.has(b.id);
      if (aIsApproaching !== bIsApproaching) return aIsApproaching ? -1 : 1;

      const aIsPriority = a.isPriority;
      const bIsPriority = b.isPriority;
      if (aIsPriority !== bIsPriority) return aIsPriority ? -1 : 1;

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  };

  const pendingOrders = useMemo(() => sortOrders(orders.filter(o => o.status === OrderStatus.PendingConfirmation)), [orders, approachingOrders]);
  const inPreparationOrders = useMemo(() => sortOrders(orders.filter(o => o.status === OrderStatus.InPreparation)), [orders, approachingOrders]);
  const readyExternalOrders = useMemo(() => sortOrders(orders.filter(o => o.status === OrderStatus.ReadyForExternalPickup)), [orders, approachingOrders]);

  return (
    <div>
      <style>{`
        @keyframes pulse-border {
          0% { box-shadow: 0 0 0 0 rgba(218, 165, 32, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(218, 165, 32, 0); }
          100% { box-shadow: 0 0 0 0 rgba(218, 165, 32, 0); }
        }
      `}</style>
      <audio
        ref={audioRef}
        src={tenantConfig?.kdsNotificationSoundUrl || "/sounds/notification.mp3"}
        preload="auto"
      />
      <Title level={2}>Kitchen Display System (KDS)</Title>
      <Tabs activeKey={activeZone} onChange={handleTabChange}>
        <TabPane tab="Todos" key="all" />
        {zones.map(zone => (
          <TabPane tab={zone.name} key={zone.id} />
        ))}
      </Tabs>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />}

      {loading ? (
        <Spin tip="Cargando pedidos..." size="large" style={{ display: 'block', marginTop: 50 }} />
      ) : (
        <Row gutter={16}>
          <Col span={8}>
            <Card title={`Pendientes (${pendingOrders.length})`}>
              {pendingOrders.map(order => (
                <KdsOrderCard key={order.id} order={order} onStatusChange={handleStatusChange} activeZone={activeZone} isApproaching={approachingOrders.has(order.id)} etaMinutes={approachingOrders.get(order.id)?.etaMinutes || null} />
              ))}
            </Card>
          </Col>
          <Col span={8}>
            <Card title={`En Preparación (${inPreparationOrders.length})`}>
              {inPreparationOrders.map(order => (
                <KdsOrderCard key={order.id} order={order} onStatusChange={handleStatusChange} activeZone={activeZone} isApproaching={approachingOrders.has(order.id)} etaMinutes={approachingOrders.get(order.id)?.etaMinutes || null} />
              ))}
            </Card>
          </Col>
          <Col span={8}>
            <Card title={`Listos (Externo) (${readyExternalOrders.length})`}>
              {readyExternalOrders.map(order => (
                <KdsOrderCard key={order.id} order={order} onStatusChange={handleStatusChange} activeZone={activeZone} isApproaching={approachingOrders.has(order.id)} etaMinutes={approachingOrders.get(order.id)?.etaMinutes || null} />
              ))}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default KdsPage;