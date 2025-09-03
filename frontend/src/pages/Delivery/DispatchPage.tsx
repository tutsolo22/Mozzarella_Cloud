import React, { useState, useEffect, useMemo } from 'react';
import { List, Typography, Spin, Alert, Empty, Select, Button, Card, notification, Tag, Row, Col, Space, Switch, Tooltip } from 'antd';
import { getOrdersByStatus, getUsersByRole, assignDriverToOrder, optimizeRoutes, getTenantConfiguration, updateOrderPriority } from '../../services/api';
import { Order, OrderStatus } from '../../types/order';
import { User } from '../../types/user';
import { CarOutlined, UserOutlined, RocketOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { io, Socket } from 'socket.io-client';
import DispatchMap from '../../components/Dispatch/DispatchMap';
import RouteSuggestionModal from '../../components/Dispatch/RouteSuggestionModal';
import { OptimizedRoute } from '../../types/delivery';
import { TenantConfiguration } from '../../types/tenant';
import { LatLngExpression } from 'leaflet';

const { Title, Text } = Typography;

export interface ActiveDriver {
  name: string;
  location?: { lat: number; lng: number };
}

const DispatchPage: React.FC = () => {
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDrivers, setActiveDrivers] = useState<Record<string, ActiveDriver>>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [suggestedRoutes, setSuggestedRoutes] = useState<OptimizedRoute[]>([]);
  const [previewedRoute, setPreviewedRoute] = useState<OptimizedRoute | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [tenantConfig, setTenantConfig] = useState<TenantConfiguration | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [orders, availableDrivers, config] = await Promise.all([
          getOrdersByStatus([OrderStatus.ReadyForDelivery]),
          getUsersByRole('delivery'),
          getTenantConfiguration(),
        ]);
        setReadyOrders(orders);
        setDrivers(availableDrivers);
        setTenantConfig(config);
      } catch (err) {
        setError('No se pudieron cargar los datos de despacho.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('access_token');
    const socket: Socket = io('http://localhost:3001', { auth: { token: `Bearer ${token}` } });

    socket.on('order_ready_for_dispatch', (newReadyOrder: Order) => {
      notification.info({
        message: '¡Nuevo Pedido Listo!',
        description: `El pedido #${newReadyOrder.shortId} está listo para ser despachado.`,
      });
      setReadyOrders(prev => [newReadyOrder, ...prev]);
    });

    // Escuchamos si otro manager o un repartidor asigna un pedido para quitarlo de la lista
    socket.on('order_assigned', (assignedOrder: Order) => {
      setReadyOrders(prev => prev.filter(order => order.id !== assignedOrder.id));
    });

    socket.on('order_priority_updated', (updatedOrder: Order) => {
      setReadyOrders(prev =>
        prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o))
      );
    });

    socket.on('active_drivers_update', (driversList: [string, { name: string, location?: any }][]) => {
      const driversMap: Record<string, ActiveDriver> = {};
      for (const [id, data] of driversList) {
        driversMap[id] = { name: data.name, location: data.location };
      }
      setActiveDrivers(driversMap);
    });

    socket.on('driver_location_update', (data: { driverId: string; name: string; location: { lat: number; lng: number } }) => {
      setActiveDrivers(prev => ({
        ...prev,
        [data.driverId]: { name: data.name, location: data.location },
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleAssignDriver = async (orderId: string) => {
    const driverId = selectedDrivers[orderId];
    if (!driverId) {
      notification.error({ message: 'Por favor, selecciona un repartidor.' });
      return;
    }

    try {
      await assignDriverToOrder(orderId, driverId);
      notification.success({ message: `Pedido asignado correctamente.` });
      setReadyOrders(prev => prev.filter(order => order.id !== orderId));
      setSelectedDrivers(prev => {
        const newSelection = { ...prev };
        delete newSelection[orderId];
        return newSelection;
      });
    } catch (err) {
      notification.error({ message: 'Error al asignar el repartidor.' });
    }
  };

  const handleOpenOptimizer = async () => {
    setIsModalVisible(true);
    setOptimizing(true);
    try {
      // Puedes hacer este valor configurable en la UI si lo deseas
      const maxOrdersPerDriver = 5; 
      const routes = await optimizeRoutes(maxOrdersPerDriver);
      setSuggestedRoutes(routes);
    } catch (err: any) {
      notification.error({ message: 'Error al optimizar', description: err.response?.data?.message || 'No se pudo conectar con el servidor.' });
    } finally {
      setOptimizing(false);
    }
  };

  const handleAssignRoute = async (driverId: string, orderIds: string[]) => {
    notification.info({ message: `Asignando ${orderIds.length} pedidos a un repartidor...` });
    try {
      // Asignamos cada pedido en la ruta sugerida
      await Promise.all(orderIds.map(orderId => assignDriverToOrder(orderId, driverId)));
      notification.success({ message: '¡Ruta asignada con éxito!' });
      // La actualización de la lista de pedidos listos se maneja por el evento de websocket 'order_assigned'
      setIsModalVisible(false);
    } catch (err) {
      notification.error({ message: 'Error al asignar la ruta.' });
    }
  };

  const handleTogglePriority = async (orderId: string, isPriority: boolean) => {
    try {
      // Actualización optimista para una UI más rápida
      setReadyOrders(prev => prev.map(o => (o.id === orderId ? { ...o, isPriority } : o)));
      await updateOrderPriority(orderId, isPriority);
      notification.success({ message: `Prioridad del pedido actualizada.` });
    } catch (err) {
      notification.error({ message: 'Error al actualizar la prioridad.' });
      // Aquí se podría revertir el cambio si la API falla
    }
  };

  const routePath = useMemo((): LatLngExpression[] => {
    if (!previewedRoute || !tenantConfig?.restaurantLatitude || !tenantConfig?.restaurantLongitude) {
      return [];
    }

    const path = previewedRoute.orders
      .filter(o => o.latitude != null && o.longitude != null)
      .map(o => [o.latitude!, o.longitude!] as [number, number]);

    // Añadir la ubicación del restaurante como punto de partida
    path.unshift([tenantConfig.restaurantLatitude, tenantConfig.restaurantLongitude] as [number, number]);

    return path;
  }, [previewedRoute, tenantConfig]);

  if (loading) return <Spin tip="Cargando pedidos para despachar..." />;
  if (error) return <Alert message="Error" description={error} type="error" />;

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={10}>
          <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Title level={2} style={{ margin: 0 }}>Pedidos para Despachar</Title>
            <Button icon={<RocketOutlined />} onClick={handleOpenOptimizer}>
              Optimizar Rutas
            </Button>
          </Space>
          {readyOrders.length === 0 ? (
            <Card><Empty description="No hay pedidos listos para despachar." /></Card>
          ) : (
            <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <List
                grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 1, xl: 2 }}
                dataSource={readyOrders}
                renderItem={order => (
                  <List.Item>
                    <Card 
                      title={`Pedido #${order.shortId}`} 
                      size="small"
                      extra={
                        <Tooltip title="Marcar como prioritario">
                          <Switch
                            checkedChildren={<StarFilled />}
                            unCheckedChildren={<StarOutlined />}
                            checked={order.isPriority}
                            onChange={(checked) => handleTogglePriority(order.id, checked)}
                          />
                        </Tooltip>
                      }>
                      <p><UserOutlined /> {order.customer?.fullName || 'Cliente sin nombre'}</p>
                      <p><Text copyable>{order.deliveryAddress}</Text></p>
                      <p><Tag color={order.orderType === 'delivery' ? 'blue' : 'green'}>{order.orderType}</Tag></p>
                      <Select
                        placeholder="Seleccionar repartidor"
                        style={{ width: '100%', marginBottom: 8 }}
                        onChange={(driverId) => setSelectedDrivers(prev => ({ ...prev, [order.id]: driverId }))}
                        options={drivers.map(d => ({ label: d.fullName, value: d.id }))}
                      />
                      <Button type="primary" icon={<CarOutlined />} block onClick={() => handleAssignDriver(order.id)}>
                        Asignar y Despachar
                      </Button>
                    </Card>
                  </List.Item>
                )}
              />
            </div>
          )}
        </Col>
        <Col xs={24} lg={14}>
          <Title level={2}>Mapa de Operaciones</Title>
          <DispatchMap orders={readyOrders} drivers={activeDrivers} routePath={routePath} />
        </Col>
      </Row>
      <RouteSuggestionModal
        visible={isModalVisible}
        routes={suggestedRoutes}
        onCancel={() => setIsModalVisible(false)}
        onAssignRoute={handleAssignRoute}
        onPreviewRoute={setPreviewedRoute}
        loading={optimizing}
      />
    </div>
  );
};

export default DispatchPage;