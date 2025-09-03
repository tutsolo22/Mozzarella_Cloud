import React from 'react';
import { Modal, List, Button, Typography, Tag, Empty, Progress, Space, Divider } from 'antd';
import { OptimizedRoute } from '../../types/delivery';
import { CarOutlined, BoxPlotOutlined, GatewayOutlined, ClockCircleOutlined, StarFilled } from '@ant-design/icons';

const { Text } = Typography;

interface RouteSuggestionModalProps {
  visible: boolean;
  routes: OptimizedRoute[];
  onCancel: () => void;
  onAssignRoute: (driverId: string, orderIds: string[]) => void;
  onPreviewRoute: (route: OptimizedRoute | null) => void;
  loading: boolean;
}

const RouteSuggestionModal: React.FC<RouteSuggestionModalProps> = ({
  visible,
  routes,
  onCancel,
  onAssignRoute,
  onPreviewRoute,
  loading,
}) => {

  const getPercent = (current?: string, max?: number) => {
    if (!max || max === 0) return 0;
    return Math.round((parseFloat(current || '0') / max) * 100);
  };

  return (
    <Modal
      title="Sugerencias de Rutas Optimizadas"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      {loading && <p>Calculando rutas...</p>}
      {!loading && routes.length === 0 && <Empty description="No se pudieron generar rutas. Asegúrate de que haya pedidos listos y repartidores disponibles." />}
      
      <List
        itemLayout="vertical"
        dataSource={routes}
        renderItem={(route) => (
          <div onMouseEnter={() => onPreviewRoute(route)} onMouseLeave={() => onPreviewRoute(null)}>
            <List.Item
              key={route.driverId}
              actions={[
                <Button
                  type="primary"
                  icon={<CarOutlined />}
                  onClick={() => onAssignRoute(route.driverId, route.orders.map(o => o.id))}
                >
                  Asignar esta Ruta
                </Button>
              ]}
            >
              <List.Item.Meta
                title={<Text strong>{route.driverName}</Text>}
                description={
                  <Space wrap>
                    <Tag color="blue">{route.orderCount} pedidos</Tag>
                    {route.estimatedDurationMinutes != null ? (
                      <Tag icon={<ClockCircleOutlined />} color="purple">
                        ~{route.estimatedDurationMinutes} min
                      </Tag>
                    ) : (
                      <Tag color="purple">~{route.estimatedDistanceKm} km</Tag>
                    )}
                  </Space>
                }
              />
              <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
                  <Text><GatewayOutlined /> Carga (Peso): {route.currentWeightKg} / {route.maxWeightKg || 'N/A'} kg</Text>
                  <Progress percent={getPercent(route.currentWeightKg, route.maxWeightKg)} size="small" />
                  <Text><BoxPlotOutlined /> Carga (Volumen): {route.currentVolumeM3} / {route.maxVolumeM3 || 'N/A'} m³</Text>
                  <Progress percent={getPercent(route.currentVolumeM3, route.maxVolumeM3)} size="small" status="active" />
              </Space>
              <Divider style={{ margin: '12px 0' }} />
              <List
                size="small"
                dataSource={route.orders}
                renderItem={(order, index) => (
                  <List.Item>
                    <Space>
                      {order.isPriority && <StarFilled style={{ color: '#faad14' }} />}
                      <span>{index + 1}. Pedido #{order.shortId} - {order.deliveryAddress}</span>
                    </Space>
                  </List.Item>
                )}
              />
            </List.Item>
          </div>
        )}
      />
    </Modal>
  );
};

export default RouteSuggestionModal;