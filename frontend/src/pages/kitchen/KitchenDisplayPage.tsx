import React, { useEffect, useState } from 'react';
import { getOrdersByStatus, updateOrderStatus } from '../../services/api';
import { Order, OrderStatus } from '../../types/order';
import { Col, Row, Typography, Spin, Alert, Empty, notification } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, FireOutlined } from '@ant-design/icons';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import OrderCard from '../../components/KDS/OrderCard';

const { Title, Text } = Typography;

const KitchenDisplayPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const [pending, inPreparation] = await Promise.all([
          getOrdersByStatus([OrderStatus.Confirmed]),
          getOrdersByStatus([OrderStatus.InPreparation]),
        ]);
        // Unificamos los pedidos en un solo estado
        setOrders([...pending, ...inPreparation].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      } catch (err) {
        setError('No se pudieron cargar los pedidos. Intenta de nuevo más tarde.');
        console.error(err);
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

    socket.on('connect', () => console.log('Conectado al KDS.'));

    socket.on('new_order_for_kitchen', (newOrder: Order) => {
      notification.info({
        message: '¡Nuevo Pedido!',
        description: `Ha entrado el pedido #${newOrder.shortId}.`,
        placement: 'topRight',
      });
      // Simplemente añadimos el nuevo pedido al estado unificado
      setOrders(prev => [...prev, newOrder]);
    });

    // Escuchamos cuando un pedido se marca como listo para que desaparezca del KDS
    socket.on('order_ready_for_dispatch', (readyOrder: Order) => {
      setOrders(prev => prev.filter(o => o.id !== readyOrder.id));
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      // Actualizamos el pedido en nuestro estado unificado. React se encarga del resto.
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      notification.success({ message: `Pedido #${updatedOrder.shortId} actualizado.` });
    } catch (err) {
      notification.error({ message: 'Error al actualizar el pedido.' });
    }
  };

  if (loading) return <Spin />;
  if (error) return <Alert message="Error" description={error} type="error" />;

  // Derivamos las listas a partir del estado unificado
  const pendingOrders = orders.filter(o => o.status === OrderStatus.Confirmed);
  const inPreparationOrders = orders.filter(o => o.status === OrderStatus.InPreparation);

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Panel de Cocina (KDS)</Title>
      <Title level={4}><ClockCircleOutlined /> Pedidos Pendientes ({pendingOrders.length})</Title>
      <Row gutter={[16, 16]}>
        {pendingOrders.length > 0 ? (
          pendingOrders.map((order) => (
            <Col xs={24} sm={12} md={8} lg={6} key={order.id}>
              <OrderCard order={order} onStatusUpdate={handleStatusUpdate} />
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty description="No hay pedidos pendientes." />
          </Col>
        )}
      </Row>

      <Title level={4} style={{ marginTop: 32 }}><FireOutlined /> En Preparación ({inPreparationOrders.length})</Title>
      <Row gutter={[16, 16]}>
        {inPreparationOrders.length > 0 ? (
          inPreparationOrders.map((order) => (
            <Col xs={24} sm={12} md={8} lg={6} key={order.id}>
              <OrderCard order={order} onStatusUpdate={handleStatusUpdate} />
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty description="No hay pedidos en preparación." />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default KitchenDisplayPage;