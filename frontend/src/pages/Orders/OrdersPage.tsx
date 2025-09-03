import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Tooltip, Alert, Typography } from 'antd';
import { getOrders } from '../../services/api';
import { Order, OrderStatus } from '../../types/order';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { EyeOutlined, WarningOutlined } from '@ant-design/icons';

const { Title } = Typography;

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        setError('No se pudieron cargar los pedidos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const columns: ColumnsType<Order> = [
    {
      title: 'ID Pedido',
      dataIndex: 'shortId',
      key: 'shortId',
      render: (text, record) => (
        <Space>
          {record.notes?.includes('¡ATENCIÓN! Pedido fuera del área de entrega.') && (
            <Tooltip title="Pedido fuera del área de entrega">
              <WarningOutlined style={{ color: '#faad14', fontSize: '16px' }} />
            </Tooltip>
          )}
          <span>#{text}</span>
        </Space>
      ),
    },
    {
      title: 'Cliente',
      dataIndex: ['customer', 'fullName'],
      key: 'customer',
      render: (text) => text || 'Consumidor Final',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => {
        let color = 'geekblue';
        if (status === OrderStatus.Delivered) color = 'green';
        if (status === OrderStatus.Cancelled) color = 'red';
        if (status === OrderStatus.InDelivery) color = 'orange';
        return <Tag color={color}>{status.replace(/_/g, ' ').toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `$${parseFloat(amount).toFixed(2)}`,
    },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Button icon={<EyeOutlined />} onClick={() => console.log('Ver detalle', record.id)}>Ver</Button>
      ),
    },
  ];

  // Función para añadir una clase CSS a la fila si está fuera de zona
  const getRowClassName = (record: Order) => {
    return record.notes?.includes('¡ATENCIÓN! Pedido fuera del área de entrega.') ? 'table-row-warning' : '';
  };

  return (
    <div>
      <style>{`.table-row-warning > td { background: #fffbe6 !important; }`}</style>
      <Title level={2}>Gestión de Pedidos</Title>
      {error && <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Table columns={columns} dataSource={orders} loading={loading} rowKey="id" rowClassName={getRowClassName} />
    </div>
  );
};

export default OrdersPage;