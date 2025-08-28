import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, InputNumber, Button, notification, Spin, Input, Table } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Ingredient } from '../types/product';
import { purchaseIngredients, registerWaste, adjustStock } from '../services/api';

export type OperationType = 'purchase' | 'waste' | 'adjustment';

interface InventoryOperationModalProps {
  open: boolean;
  onClose: (shouldReload: boolean) => void;
  operationType: OperationType;
  ingredients: Ingredient[];
}

const operationConfig = {
  purchase: {
    title: 'Registrar Compra',
    okText: 'Registrar Compra',
    quantityLabel: 'Cantidad Comprada',
    apiCall: purchaseIngredients,
  },
  waste: {
    title: 'Registrar Merma',
    okText: 'Registrar Merma',
    quantityLabel: 'Cantidad Desechada',
    apiCall: registerWaste,
  },
  adjustment: {
    title: 'Ajustar Stock',
    okText: 'Ajustar Stock',
    quantityLabel: 'Nueva Cantidad en Stock',
    apiCall: adjustStock,
  },
};

const InventoryOperationModal: React.FC<InventoryOperationModalProps> = ({ open, onClose, operationType, ingredients }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const config = operationConfig[operationType];

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const items = (values.items || []).filter((item: any) => item && item.ingredientId && item.quantity >= 0);

      if (items.length === 0) {
        notification.warning({ message: 'No hay items para registrar.' });
        return;
      }
      
      setLoading(true);
      await config.apiCall(items);
      notification.success({ message: 'Operación registrada con éxito' });
      onClose(true);
    } catch (error) {
      if (!(error as any).errorFields) {
        notification.error({ message: 'Error al registrar la operación' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={config.title}
      open={open}
      onCancel={() => onClose(false)}
      onOk={handleSave}
      okText={config.okText}
      confirmLoading={loading}
      width={900}
      destroyOnClose
    >
      <Form form={form} autoComplete="off" initialValues={{ items: [{}] }}>
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              <Table
                dataSource={fields}
                pagination={false}
                bordered
                size="small"
                rowKey="key"
                columns={[
                  {
                    title: 'Ingrediente',
                    key: 'ingredient',
                    render: (field) => (
                      <Form.Item {...field} name={[field.name, 'ingredientId']} rules={[{ required: true, message: 'Seleccione' }]} noStyle>
                        <Select
                          showSearch
                          style={{ width: '100%' }}
                          placeholder="Seleccione un ingrediente"
                          filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                          options={ingredients.map(ing => ({ value: ing.id, label: `${ing.name} (${ing.unit})` }))}
                        />
                      </Form.Item>
                    ),
                  },
                  {
                    title: config.quantityLabel,
                    key: 'quantity',
                    render: (field) => (
                      <Form.Item {...field} name={[field.name, 'quantity']} rules={[{ required: true, message: 'Ingrese' }]} noStyle>
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'Razón/Notas',
                    key: 'reason',
                    render: (field) => (
                      <Form.Item {...field} name={[field.name, 'reason']} rules={[{ required: operationType === 'adjustment', message: 'Requerido' }]} noStyle>
                        <Input placeholder="Ej: Conteo físico..." />
                      </Form.Item>
                    ),
                  },
                  {
                    title: 'Acción',
                    key: 'action',
                    width: '10%',
                    render: (_, record) => (
                      <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => remove(record.name)} />
                    ),
                  },
                ]}
              />
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ marginTop: 16 }}>
                Añadir Item
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default InventoryOperationModal;