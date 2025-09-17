import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, notification } from 'antd';
import { Ingredient } from '../../types/product';
import { createIngredient, updateIngredient } from '../../services/api';

interface IngredientFormProps {
  open: boolean;
  onClose: (shouldReload: boolean) => void;
  ingredient: Ingredient | null;
}

const IngredientForm: React.FC<IngredientFormProps> = ({ open, onClose, ingredient }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset form when modal opens for a new ingredient or changes ingredient
    if (open) { // Ensures this runs only when modal is opening or props change while open
      if (ingredient) {
        form.setFieldsValue(ingredient);
      } else {
        form.resetFields();
        form.setFieldsValue({ stockQuantity: 0, lowStockThreshold: 0 });
      }
    }
  }, [ingredient, form, open]);

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      if (ingredient) {
        await updateIngredient(ingredient.id, values);
      } else {
        // Ensure stockQuantity is part of the values for creation
        const createValues = { ...values, stockQuantity: values.stockQuantity || 0 };
        await createIngredient(createValues);
      }
      notification.success({ message: `Ingrediente ${ingredient ? 'actualizado' : 'creado'} con éxito` });
      onClose(true);
    } catch (err) {
      notification.error({ message: 'Error al guardar el ingrediente' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={ingredient ? 'Editar Ingrediente' : 'Añadir Ingrediente'}
      open={open}
      onCancel={() => onClose(false)}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="name" label="Nombre del Ingrediente" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="unit" label="Unidad de Medida" rules={[{ required: true }]}>
          <Select placeholder="Seleccione una unidad">
            <Select.Option value="kg">Kilogramos (kg)</Select.Option>
            <Select.Option value="g">Gramos (g)</Select.Option>
            <Select.Option value="l">Litros (l)</Select.Option>
            <Select.Option value="ml">Mililitros (ml)</Select.Option>
            <Select.Option value="unidades">Unidades</Select.Option>
          </Select>
        </Form.Item>
        {!ingredient && (
          <Form.Item
            name="stockQuantity"
            label="Cantidad Inicial en Stock"
            rules={[{ required: true, type: 'number', min: 0 }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        )}
        <Form.Item name="lowStockThreshold" label="Umbral de Stock Bajo" rules={[{ required: true, type: 'number', min: 0 }]} help="Recibirás una notificación cuando el stock caiga por debajo de este valor.">
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            {ingredient ? 'Guardar Cambios' : 'Crear Ingrediente'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default IngredientForm;
