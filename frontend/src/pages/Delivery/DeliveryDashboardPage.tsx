import React, { useEffect, useState } from 'react';
import { getMyDeliveries, updateOrderStatus, getOrdersByStatus, assignDriverToOrder } from '../../services/api';
import { Order, OrderStatus, PaymentMethod } from '../../types/order';
import { Card, Col, Row, Statistic, Typography, List, Spin, Alert, Empty, Tabs, notification, Tag, Button } from 'antd';
import { CheckCircleOutlined, CarOutlined, DollarCircleOutlined, CreditCardOutlined, WarningOutlined, BellOutlined, ClockCircleOutlined, GiftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';
import { io, Socket } from 'socket-io.client';
import DeliveryMap from '../../components/DeliveryMap';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const DeliveryDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  dayjs.extend(relativeTime);
  dayjs.locale('es');

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setLoading(true);
        const [myOrders, readyForDispatch] = await Promise.all([
          getMyDeliveries(),
          getOrdersByStatus([OrderStatus.ReadyForDelivery])
        ]);
        setOrders(myOrders);
        setAvailableOrders(readyForDispatch);
      } catch (err) {
        setError('No se pudieron cargar las entregas. Intenta de nuevo más tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  // Efecto para la conexión con WebSockets
  useEffect(() => {
    // 1. Obtenemos el token de autenticación para identificarnos con el servidor
    const token = localStorage.getItem('access_token'); // Make sure user is loaded before connecting
    if (!token) {
      console.error("No hay token de autenticación para la conexión WebSocket.");
      return;
    }

    // 2. Conectamos al servidor de WebSockets (asegúrate que la URL es la de tu backend)
    const socket: Socket = io('http://localhost:3001', {
      auth: {
        token: `Bearer ${token}`
      }
    });

    socket.on('connect', () => {
      console.log('Conectado al servidor de WebSockets para repartos en tiempo real.');
    });

    // 3. Escuchamos el evento 'new_delivery_for_driver' que enviará el backend
    socket.on('new_delivery_for_driver', (newOrder: Order) => {
      notification.info({
        message: '¡Nuevo pedido asignado!',
        description: `El pedido #${newOrder.shortId} ha sido añadido a tu ruta.`,
        placement: 'topRight',
        icon: <BellOutlined style={{ color: '#108ee9' }} />,
      });
      // Añadimos el nuevo pedido al principio de la lista, lo que actualizará la UI
      setOrders(prevOrders => [newOrder, ...prevOrders]);
    });

    // 5. Escuchamos el evento de actualización de ubicación
    socket.on('delivery_location_updated', (updatedOrder: Order) => {
      notification.warning({
        message: '¡Ubicación Actualizada!',
        description: `La ubicación del pedido #${updatedOrder.shortId} ha sido modificada por el personal.`,
        placement: 'topRight',
        icon: <WarningOutlined style={{ color: '#faad14' }} />,
      });

      // Actualizamos el pedido en el estado local
      setOrders(prevOrders =>
        prevOrders.map(order => (order.id === updatedOrder.id ? updatedOrder : order)),
      );
    });

    // Escuchamos cuando un pedido está listo para despacho
    socket.on('order_ready_for_dispatch', (newReadyOrder: Order) => {
      setAvailableOrders(prev => [newReadyOrder, ...prev].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    });

    // Escuchamos cuando un pedido es asignado (por un manager u otro repartidor)
    socket.on('order_assigned', (assignedOrder: Order) => {
      // Lo quitamos de la lista de disponibles
      setAvailableOrders(prev => prev.filter(o => o.id !== assignedOrder.id));
      // Si es para mi, lo agrego a mi ruta
      if (user && assignedOrder.assignedDriverId === user.id) {
        setOrders(prev => [assignedOrder, ...prev]);
      }
    });

    let watchId: number | null = null;
    if (socket && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          socket.emit('update_driver_location', { lat: latitude, lng: longitude });
        },
        (error) => console.error("Error getting driver location:", error),
        { enableHighAccuracy: true }
      );
    }

    // 4. Limpieza: Nos desconectamos cuando el componente se desmonta
    return () => {
      console.log('Desconectando del servidor de WebSockets.');
      socket.disconnect();
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [user]);

  const handleMarkAsDelivered = async (orderId: string) => {
    try {
      // 1. Llamamos a la API para actualizar el estado
      const updatedOrder = await updateOrderStatus(orderId, OrderStatus.Delivered);

      // 2. Actualizamos el estado local para reflejar el cambio inmediatamente
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: OrderStatus.Delivered, updatedAt: updatedOrder.updatedAt } : order
        )
      );

      // 3. Mostramos una notificación de éxito
      notification.success({
        message: '¡Pedido Entregado!',
        description: `El pedido #${updatedOrder.shortId} se ha marcado como entregado.`,
        placement: 'topRight',
      });
    } catch (err) {
      console.error("Error al actualizar el estado del pedido:", err);
      notification.error({
        message: 'Error',
        description: 'No se pudo actualizar el estado del pedido. Inténtalo de nuevo.',
      });
    }
  };

  const handleClaimOrder = async (orderId: string) => {
    if (!user) return;
    try {
      const updatedOrder = await assignDriverToOrder(orderId, user.id);
      notification.success({
        message: '¡Pedido Reclamado!',
        description: `El pedido #${updatedOrder.shortId} ha sido añadido a tu ruta.`,
      });
      // El evento de websocket 'order_assigned' se encargará de actualizar los estados en todos los clientes.
    } catch (err) {
      notification.error({ message: 'No se pudo reclamar el pedido.' });
    }
  };

  // 2. Procesamos los datos para el dashboard
  const deliveredOrders = orders.filter(o => o.status === OrderStatus.Delivered);
  const allPendingOrders = orders.filter(o => o.status === OrderStatus.InDelivery);

  // Separamos los pedidos pendientes entre los que se pueden mapear y los que no.
  const mappablePendingOrders = allPendingOrders.filter(o => o.latitude && o.longitude);
  const unmappablePendingOrders = allPendingOrders.filter(o => !o.latitude || !o.longitude);

  const totalCash = deliveredOrders
    .filter(o => o.paymentMethod === PaymentMethod.Cash)
    .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

  const totalCard = deliveredOrders
    .filter(o => o.paymentMethod !== PaymentMethod.Cash)
    .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><Spin size="large" tip="Cargando tus entregas..." /></div>;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  // 3. Componente para renderizar cada item de la lista
  const renderOrderItem = (order: Order) => (
    <List.Item>
      <List.Item.Meta
        title={`Pedido #${order.shortId || order.id.substring(0, 8)}`}
        description={
          <>
            <div>{order.deliveryAddress}</div>
            <div><Text strong>Total: ${parseFloat(order.totalAmount).toFixed(2)}</Text> - <Text>Pago: {order.paymentMethod === PaymentMethod.Cash ? 'Efectivo' : 'Otro'}</Text></div>
            {order.notes?.includes('¡ATENCIÓN! Pedido fuera del área de entrega.') && (
              <Tag icon={<WarningOutlined />} color="warning" style={{ marginTop: 4 }}>
                Fuera del área de entrega
              </Tag>
            )}
            {order.estimatedDeliveryAt && (
              <div style={{ marginTop: 4 }}>
                <Text type={dayjs().isAfter(dayjs(order.estimatedDeliveryAt)) ? 'danger' : 'secondary'}>
                  <ClockCircleOutlined style={{ marginRight: 8 }} />
                  Entrega estimada: {dayjs(order.estimatedDeliveryAt).format('HH:mm')} hs
                </Text>
              </div>
            )}
          </>
        }
      />
      <Text type="secondary">{dayjs(order.createdAt).format('HH:mm')} hs</Text>
    </List.Item>
  );

  const renderAvailableOrderItem = (order: Order) => (
    <List.Item
      actions={[
        <Button type="primary" onClick={() => handleClaimOrder(order.id)}>
          Reclamar
        </Button>
      ]}
    >
      <List.Item.Meta
        title={`Pedido #${order.shortId}`}
        description={`${order.deliveryAddress} - Total: $${parseFloat(order.totalAmount).toFixed(2)}`}
      />
      <Text type="secondary">{dayjs(order.createdAt).fromNow()}</Text>
    </List.Item>
  );

  return (
    <div>
      <Title level={2}>Mis Entregas del Día</Title>
      
      {/* 4. Tarjetas de resumen para el corte de caja */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}><Card><Statistic title="Pedidos Entregados" value={deliveredOrders.length} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={8}><Card><Statistic title="Efectivo a Rendir" value={totalCash} precision={2} prefix={<DollarCircleOutlined />} suffix="ARS" /></Card></Col>
        <Col span={8}><Card><Statistic title="Cobrado (Otros Medios)" value={totalCard} precision={2} prefix={<CreditCardOutlined />} suffix="ARS" /></Card></Col>
      </Row>

      {/* 5. Listas de pedidos pendientes y entregados */}
      {unmappablePendingOrders.length > 0 && (
        <Alert
          message="Pedidos sin Ubicación"
          description={
            <div>
              <p>Los siguientes pedidos no se pueden mostrar en el mapa porque no tienen coordenadas. Por favor, verifica sus direcciones en el panel de administración:</p>
              <List
                size="small"
                dataSource={unmappablePendingOrders}
                renderItem={order => <List.Item>Pedido #{order.shortId} - {order.deliveryAddress}</List.Item>}
              />
            </div>
          }
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 24 }}
        />
      )}
      <Tabs defaultActiveKey="my-route">
        <TabPane tab={<><CarOutlined /> Mi Ruta ({mappablePendingOrders.length})</>} key="my-route">
          <Row gutter={16}>
            <Col xs={24} md={10}>
              <List itemLayout="horizontal" dataSource={mappablePendingOrders} renderItem={renderOrderItem} locale={{ emptyText: <Empty description="No tienes pedidos en reparto" /> }} />
            </Col>
            <Col xs={24} md={14}>
              {mappablePendingOrders.length > 0 && <DeliveryMap orders={mappablePendingOrders} onMarkAsDelivered={handleMarkAsDelivered} />}
            </Col>
          </Row>
        </TabPane>
        <TabPane tab={<><GiftOutlined /> Pedidos Disponibles ({availableOrders.length})</>} key="available">
          <List
            dataSource={availableOrders}
            renderItem={renderAvailableOrderItem}
            locale={{ emptyText: <Empty description="No hay pedidos disponibles para reclamar." /> }}
          />
        </TabPane>
        <TabPane tab={<><CheckCircleOutlined /> Entregados ({deliveredOrders.length})</>} key="delivered">
           <Row gutter={16}>
            <Col xs={24}>
              <Card>
                <List itemLayout="horizontal" dataSource={deliveredOrders} renderItem={renderOrderItem} locale={{ emptyText: <Empty description="Aún no has entregado pedidos hoy" /> }} />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default DeliveryDashboardPage;