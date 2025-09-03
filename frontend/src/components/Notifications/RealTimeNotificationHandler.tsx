import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { io, Socket } from 'socket.io-client';
import { notification, Button } from 'antd';
import { Order } from '../../types/order';
import { useNavigate } from 'react-router-dom';
import { BellOutlined } from '@ant-design/icons';

const RealTimeNotificationHandler: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Solo nos conectamos si el usuario tiene permisos de gestión.
    // Puedes ajustar los nombres de los permisos según tu sistema.
    if (!user || !hasPermission('manage:delivery')) {
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const socket: Socket = io('http://localhost:3001', {
      auth: { token: `Bearer ${token}` },
    });

    socket.on('connect', () => {
      console.log('Conectado para notificaciones de management.');
    });

    socket.on('order_ready_for_dispatch', (order: Order) => {
      const key = `dispatch-notif-${order.id}`;
      const btn = (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            // TODO: Crear esta página en el siguiente paso
            navigate('/delivery/dispatch');
            notification.destroy(key);
          }}
        >
          Asignar Repartidor
        </Button>
      );

      notification.open({
        message: 'Pedido Listo para Despacho',
        description: `El pedido #${order.shortId} está listo para ser entregado o recogido.`,
        placement: 'topRight',
        icon: <BellOutlined style={{ color: '#52c41a' }} />,
        btn,
        key,
        duration: 0, // La notificación no se cierra automáticamente
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, hasPermission, navigate]);

  return null; // Este componente no renderiza nada visible
};

export default RealTimeNotificationHandler;