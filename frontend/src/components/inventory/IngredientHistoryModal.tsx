import React, { useState, useEffect, FC } from 'react';
import { Modal, Table, Spin, message, Tag, Typography } from 'antd';
import { getIngredientMovements } from '../../services/ingredients';
import { InventoryMovement } from '../../types/inventory';
import { InventoryMovementType } from '../../types/enums';

const { Text } = Typography;

interface IngredientHistoryModalProps {
  ingredientId: string | null;
  ingredientName: string | null;
  visible: boolean;
  onClose: () => void;
}

const movementTypeMap: Record<InventoryMovementType, { text: string; color: string }> = {
  [InventoryMovementType.Purchase]: { text: 'Compra', color: 'green' },
  [InventoryMovementType.Sale]: { text: 'Venta', color: 'blue' },
  [InventoryMovementType.Waste]: { text: 'Merma', color: 'orange' },
  [InventoryMovementType.Adjustment]: { text: 'Ajuste', color: 'purple' },
};

const IngredientHistoryModal: FC<IngredientHistoryModalProps> = ({ ingredientId, ingredientName, visible, onClose }) => {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && ingredientId) {
      const fetchMovements = async () => {
        setLoading(true);
        try {
          const data = await getIngredientMovements(ingredientId);
          setMovements(data);
        } catch (error) {
          message.error('Error al cargar el historial de movimientos.');
        } finally {
          setLoading(false);
        }
      };
      fetchMovements();
    }
  }, [visible, ingredientId]);

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
      sorter: (a: InventoryMovement, b: InventoryMovement) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: InventoryMovementType) => {
        const { text, color } = movementTypeMap[type] || { text: type, color: 'default' };
        return <Tag color={color}>{text.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Cambio',
      dataIndex: 'quantityChange',
      key: 'quantityChange',
      render: (quantity: number) => {
        const isPositive = quantity > 0;
        return (
          <Text type={isPositive ? 'success' : 'danger'}>
            {isPositive ? '+' : ''}{quantity.toFixed(3)}
          </Text>
        );
      },
      align: 'right' as const,
    },
    {
      title: 'Usuario',
      dataIndex: ['user', 'fullName'],
      key: 'user',
      render: (fullName: string) => fullName || 'Sistema',
    },
    {
      title: 'Motivo / Referencia',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string, record: InventoryMovement) => {
        if (record.type === InventoryMovementType.Sale && record.order) {
          return `Pedido #${record.order.shortId}`;
        }
        return reason;
      },
    },
  ];

  return (
    <Modal
      title={`Historial de Movimientos: ${ingredientName || ''}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      <Spin spinning={loading}>
        <Table columns={columns} dataSource={movements} rowKey="id" pagination={{ pageSize: 10 }} />
      </Spin>
    </Modal>
  );
};

export default IngredientHistoryModal;