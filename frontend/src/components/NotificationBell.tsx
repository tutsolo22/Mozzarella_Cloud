import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, Button, List, Spin, Empty, Typography } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';
import { Notification } from '../../types/notification';
import { useAuth } from '../hooks/useAuth';

const { Text } = Typography;

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      // Silently fail, don't bother the user
      console.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Poll every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read");
    }
  };

  const menu = (
    <div style={{ width: 350, backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', borderRadius: '4px' }}>
      <List
        header={<div style={{ padding: '8px 12px', fontWeight: 'bold' }}>Notificaciones</div>}
        footer={
          <div style={{ padding: '8px 12px', textAlign: 'center' }}>
            <Button type="link" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
              Marcar todas como leídas
            </Button>
          </div>
        }
        dataSource={notifications}
        loading={loading}
        locale={{ emptyText: <Empty description="No hay notificaciones" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
        renderItem={item => (
          <List.Item
            style={{ padding: '12px', borderBottom: '1px solid #f0f0f0', backgroundColor: item.isRead ? 'transparent' : '#e6f7ff' }}
            actions={[
              !item.isRead && <Button type="text" shape="circle" icon={<CheckOutlined />} onClick={() => handleMarkAsRead(item.id)} title="Marcar como leída" />
            ]}
          >
            <List.Item.Meta
              title={<Text strong={!item.isRead}>{item.type === 'low_stock' ? 'Stock Bajo' : 'Notificación'}</Text>}
              description={item.message}
            />
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']} open={open} onOpenChange={setOpen}>
      <Badge count={unreadCount}>
        <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;