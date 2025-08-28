import React, { useState, useEffect } from 'react';
import { Table, Typography, Spin, Alert, Tag, Select, Button, notification } from 'antd';
import { getOrders, updateOrderStatus } from '../../services/api';
import { Order, OrderStatus } from '../../types/order';

const { Title } = Typography;

const statusColors: { [key in OrderStatus]: string } = {
  pending_confirmation: 'gold',
  confirmed: 'lime',
  in_preparation: 'processing',
  ready_for_delivery: 'cyan',
  in_delivery: 'blue',
  delivered: 'success',
  cancelled: 'error',
};

const statusLabels: { [key in OrderStatus]: string } = {
  pending_confirmation: 'Pendiente',
  confirmed: 'Confirmado',
  in_preparation: 'En Preparación',
  ready_for_delivery: 'Listo para Entregar',
  in_delivery: 'En Reparto',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError('No se pudieron cargar los pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      notification.success({ message: 'Estado del pedido actualizado' });
      fetchOrders(); // Recargar la lista de pedidos
    } catch (err) {
      notification.error({ message: 'Error al actualizar el estado' });
    }
  };

  const columns = [
    {
      title: 'ID Pedido',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <code>{id.split('-')[0]}</code>,
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => items.map(item => (
        <div key={item.id}>
          {item.quantity}x {item.product.name}
          {item.notes && (
            <div style={{ fontSize: '0.8em', color: 'gray' }}><em>Nota: {item.notes}</em></div>
          )}
        </div>
      )),
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus, record: Order) => (
        <Select
          defaultValue={status}
          style={{ width: 150 }}
          onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
        >
          {Object.entries(statusLabels).map(([key, label]) => (
            <Select.Option key={key} value={key}>{label}</Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('es-ES'),
    },
  ];

  if (loading) return <Spin tip="Cargando pedidos..." size="large" />;
  if (error) return <Alert message={error} type="error" showIcon />;

  return (
    <>
      <Title level={2}>Gestión de Pedidos</Title>
      <Table columns={columns} dataSource={orders} rowKey="id" />
    </>
  );
};

export default OrdersPage;