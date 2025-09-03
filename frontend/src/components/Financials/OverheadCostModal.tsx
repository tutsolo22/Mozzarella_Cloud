import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Button, notification } from 'antd';
import { OverheadCost, CostFrequency } from '../../types/financials';
import { createOverheadCost, updateOverheadCost } from '../../services/api';
import dayjs from 'dayjs';

interface OverheadCostModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cost: Partial<OverheadCost> | null;
}

const OverheadCostModal: React.FC<OverheadCostModalProps> = ({ visible, onClose, onSuccess, cost }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const isEditing = !!cost?.id;

  useEffect(() => {
    if (visible) {
      if (isEditing) {
        form.setFieldsValue({
          ...cost,
          amount: Number(cost.amount),
          costDate: dayjs(cost.costDate),
        });
      } else {
        form.resetFields();
        form.setFieldValue('costDate', dayjs());
      }
    }
  }, [cost, visible, form, isEditing]);

  const handleFinish = async (values: any) => {
    setLoading(true);
    const dataToSubmit = {
      ...values,
      costDate: values.costDate.format('YYYY-MM-DD'),
    };

    try {
      if (isEditing) {
        await updateOverheadCost(cost!.id!, dataToSubmit);
        notification.success({ message: 'Costo actualizado' });
      } else {
        await createOverheadCost(dataToSubmit);
        notification.success({ message: 'Costo creado' });
      }
      onSuccess();
      onClose();
    } catch (err) {
      notification.error({ message: 'Error al guardar el costo' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Editar Costo Operativo' : 'Añadir Costo Operativo'}
      open={visible}
      onCancel={onClose}
      destroyOnClose
      footer={[
        <Button key="back" onClick={onClose}>Cancelar</Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>Guardar</Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="name" label="Nombre del Costo" rules={[{ required: true }]}>
          <Input placeholder="Ej: Renta del local, Gas, Cajas de pizza" />
        </Form.Item>
        <Form.Item name="description" label="Descripción (Opcional)">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="amount" label="Monto" rules={[{ required: true }]}>
          <InputNumber prefix="$" style={{ width: '100%' }} min={0} precision={2} />
        </Form.Item>
        <Form.Item name="frequency" label="Frecuencia" initialValue={CostFrequency.OneTime} rules={[{ required: true }]}>
          <Select>
            <Select.Option value={CostFrequency.OneTime}>Una vez</Select.Option>
            <Select.Option value={CostFrequency.Daily}>Diario</Select.Option>
            <Select.Option value={CostFrequency.Weekly}>Semanal</Select.Option>
            <Select.Option value={CostFrequency.Monthly}>Mensual</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="costDate" label="Fecha del Costo" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OverheadCostModal;