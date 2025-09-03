import React, { useState } from 'react';
import { Modal, Form, InputNumber, Button, notification } from 'antd';
import { Order } from '../types/order';
import { setPreparationTime } from '../services/api';

interface SetPrepTimeModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (updatedOrder: Order) => void;
}

const SetPrepTimeModal: React.FC<SetPrepTimeModalProps> = ({ order, open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!order) return;

      setLoading(true);
      const updatedOrder = await setPreparationTime(order.id, values.preparationTimeMinutes);
      notification.success({
        message: 'Tiempo de Preparación Asignado',
        description: `El pedido #${order.shortId} ha comenzado a prepararse.`,
      });
      onSuccess(updatedOrder);
      onClose();
    } catch (error: any) {
      console.error('Failed to set preparation time:', error);
      notification.error({
        message: 'Error al asignar tiempo',
        description: error.response?.data?.message || 'No se pudo asignar el tiempo de preparación.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Asignar Tiempo de Preparación (Pedido #${order?.shortId})`}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Confirmar e Iniciar Preparación"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical" initialValues={{ preparationTimeMinutes: 20 }}>
        <Form.Item name="preparationTimeMinutes" label="Tiempo de preparación estimado (minutos)" rules={[{ required: true, message: 'Por favor, ingresa el tiempo de preparación.' }]}>
          <InputNumber min={5} max={120} style={{ width: '100%' }} addonAfter="minutos" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SetPrepTimeModal;