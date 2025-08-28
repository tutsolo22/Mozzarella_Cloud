import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Spin, Alert, notification } from 'antd';
import { getOrders, updateOrderStatus } from '../../services/api';
import { Order, OrderStatus } from '../../types/order';
import OrderCard from '../../components/KDS/OrderCard';

const { Title } = Typography;

const KDSPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndFilterOrders = async () => {
    try {
      const allOrders = await getOrders();
      const activeOrders = allOrders.filter((order: Order) =>
        order.status === 'confirmed' || order.status === 'in_preparation'
      ).sort((a: Order, b: Order) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // Oldest first
      setOrders(activeOrders);
    } catch (err) {
      setError('No se pudieron cargar los pedidos.');
      // Stop polling on error
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndFilterOrders();
    const interval = setInterval(fetchAndFilterOrders, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      notification.success({ message: 'Pedido actualizado' });
      // Optimistically update the UI for better responsiveness
      setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
    } catch (err) {
      notification.error({ message: 'Error al actualizar el estado' });
    }
  };

  if (loading) return <Spin tip="Cargando pedidos de cocina..." size="large" style={{ display: 'block', marginTop: 50 }} />;
  if (error) return <Alert message={error} type="error" showIcon />;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: 'calc(100vh - 150px)' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>
        Pantalla de Cocina (KDS)
      </Title>
      <Row gutter={[16, 16]}>
        {orders.length > 0 ? (
          orders.map(order => (
            <Col key={order.id} xs={24} sm={12} md={8} lg={6}>
              <OrderCard order={order} onStatusUpdate={handleStatusUpdate} />
            </Col>
          ))
        ) : (
          <Col span={24} style={{ textAlign: 'center', marginTop: '50px' }}>
            <Alert message="No hay pedidos activos en la cocina." type="info" showIcon />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default KDSPage;