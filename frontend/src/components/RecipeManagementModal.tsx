import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Select, InputNumber, Form, notification, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Product, Ingredient, RecipeItem } from '../types/product';
import { getIngredients, getProductRecipe, assignProductRecipe } from '../services/api';

interface RecipeManagementModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

const RecipeManagementModal: React.FC<RecipeManagementModalProps> = ({ open, onClose, product }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);

  // Cargar todos los ingredientes disponibles una sola vez cuando el modal se abre
  useEffect(() => {
    if (open) {
      const fetchIngredients = async () => {
        try {
          const ingredientsData = await getIngredients();
          setAllIngredients(ingredientsData);
        } catch (error) {
          notification.error({ message: 'Error al cargar la lista de ingredientes' });
        }
      };
      fetchIngredients();
    }
  }, [open]);

  // Cargar la receta del producto seleccionado y popular el formulario
  useEffect(() => {
    const fetchAndSetRecipe = async () => {
      if (open && product) {
        setLoading(true);
        try {
          const recipeData = await getProductRecipe(product.id);
          // Form.List espera un array de objetos para el campo 'ingredients'
          form.setFieldsValue({ ingredients: recipeData });
        } catch (error) {
          notification.error({ message: 'Error al cargar los datos de la receta' });
        } finally {
          setLoading(false);
        }
      } else {
        // Limpiar el formulario cuando se cierra o no hay producto
        form.resetFields();
      }
    };

    fetchAndSetRecipe();
  }, [open, product, form]);
  const handleSave = async () => {
    if (!product) return;

    try {
      setLoading(true);
      // validateFields lanzará un error si la validación falla.
      const values = await form.validateFields();
      
      // Filtramos para no enviar ingredientes vacíos o con cantidad 0
      const payload = (values.ingredients || [])
        .filter((item: any) => item && item.ingredientId && item.quantityRequired > 0)
        .map((item: any) => ({
          ingredientId: item.ingredientId,
          quantityRequired: item.quantityRequired,
        }));

      await assignProductRecipe(product.id, payload);
      notification.success({ message: 'Receta guardada con éxito' });
      onClose();
    } catch (errorInfo) {
      // Antd form validation error will have `errorFields`.
      // We can let the form display the errors automatically.
      // For other errors, we show a notification.
      if (!(errorInfo as any).errorFields) {
        notification.error({ message: 'Error al guardar la receta' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Gestionar Receta para: ${product?.name}`}
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      confirmLoading={loading}
      width={800}
      destroyOnClose
    >
      <Spin spinning={loading && allIngredients.length === 0} tip="Cargando...">
        <Form form={form} autoComplete="off" initialValues={{ ingredients: [{}] }}>
          <Form.List name="ingredients">
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
                        <Form.Item
                          {...field}
                          name={[field.name, 'ingredientId']}
                          rules={[{ required: true, message: 'Seleccione un ingrediente' }]}
                          noStyle
                        >
                          <Select
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Seleccione un ingrediente"
                            filterOption={(input, option) =>
                              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={allIngredients.map(ing => ({
                              value: ing.id,
                              label: `${ing.name} (${ing.unit})`,
                            }))}
                          />
                        </Form.Item>
                      ),
                    },
                    {
                      title: 'Cantidad Requerida',
                      key: 'quantity',
                      render: (field) => (
                        <Form.Item
                          {...field}
                          name={[field.name, 'quantityRequired']}
                          rules={[{ required: true, message: 'Ingrese una cantidad' }]}
                          noStyle
                        >
                          <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      ),
                    },
                    {
                      title: 'Acción',
                      key: 'action',
                      width: '10%',
                      render: (_, record) => (
                        <Button
                          type="primary"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(record.name)}
                        />
                      ),
                    },
                  ]}
                />
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  style={{ marginTop: 16 }}
                >
                  Añadir Ingrediente
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Spin>
    </Modal>
  );
};

export default RecipeManagementModal;

