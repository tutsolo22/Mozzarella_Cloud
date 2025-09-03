import React, { useState, useEffect, FC } from 'react';
import { Modal, Button, Table, Select, InputNumber, message, Spin, Space, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getProductRecipe, assignProductRecipe } from '../../services/products';
import { getIngredients } from '../../services/ingredients';
import { Ingredient, RecipeItem } from '../../types/product';

const { Option } = Select;

interface RecipeManagementModalProps {
  productId: string | null;
  productName: string;
  visible: boolean;
  onClose: (refreshNeeded: boolean) => void;
}

interface EditableRecipeItem extends RecipeItem {
  key: string;
}

const RecipeManagementModal: FC<RecipeManagementModalProps> = ({ productId, productName, visible, onClose }) => {
  const [recipe, setRecipe] = useState<EditableRecipeItem[]>([]);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (visible && productId) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [recipeData, ingredientsData] = await Promise.all([
            getProductRecipe(productId),
            getIngredients(),
          ]);
          setRecipe(recipeData.map(item => ({ ...item, key: item.ingredient.id })));
          setAllIngredients(ingredientsData);
        } catch (error) {
          message.error('Error al cargar los datos de la receta');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setRecipe([]);
      setSelectedIngredient(undefined);
    }
  }, [visible, productId]);

  const handleQuantityChange = (value: number | null, ingredientId: string) => {
    const newRecipe = recipe.map(item =>
      item.ingredient.id === ingredientId ? { ...item, quantityRequired: value || 0 } : item
    );
    setRecipe(newRecipe);
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setRecipe(recipe.filter(item => item.ingredient.id !== ingredientId));
  };

  const handleAddIngredient = () => {
    if (selectedIngredient) {
      const ingredientToAdd = allIngredients.find(ing => ing.id === selectedIngredient);
      if (ingredientToAdd && !recipe.some(item => item.ingredient.id === ingredientToAdd.id)) {
        setRecipe([
          ...recipe,
          {
            ingredientId: ingredientToAdd.id,
            ingredient: ingredientToAdd,
            quantityRequired: 0,
            key: ingredientToAdd.id,
          },
        ]);
        setSelectedIngredient(undefined);
      } else {
        message.warning('El ingrediente ya está en la receta.');
      }
    }
  };

  const handleSave = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const recipeToSave = recipe.map(({ ingredient, quantityRequired }) => ({
        ingredientId: ingredient.id,
        quantityRequired,
      }));
      await assignProductRecipe(productId, recipeToSave);
      message.success('Receta guardada con éxito');
      onClose(true);
    } catch (error) {
      message.error('Error al guardar la receta');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Ingrediente', dataIndex: ['ingredient', 'name'], key: 'name' },
    {
      title: 'Cantidad Requerida',
      dataIndex: 'quantityRequired',
      key: 'quantity',
      render: (text: number, record: EditableRecipeItem) => (
        <InputNumber
          min={0}
          step={0.01}
          value={text}
          onChange={(value) => handleQuantityChange(value, record.ingredient.id)}
          addonAfter={record.ingredient.unit}
        />
      ),
    },
    {
      title: 'Acción',
      key: 'action',
      render: (_: any, record: EditableRecipeItem) => (
        <Popconfirm title="¿Quitar este ingrediente?" onConfirm={() => handleRemoveIngredient(record.ingredient.id)}>
          <Button icon={<DeleteOutlined />} danger type="link" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal title={`Gestionar Receta para: ${productName}`} open={visible} onOk={handleSave} onCancel={() => onClose(false)} width={800} confirmLoading={loading} okText="Guardar Receta" cancelText="Cancelar">
      <Spin spinning={loading}>
        <Space style={{ marginBottom: 16 }}>
          <Select showSearch style={{ width: 300 }} placeholder="Seleccionar un ingrediente para añadir" optionFilterProp="children" onChange={(value) => setSelectedIngredient(value)} value={selectedIngredient} filterOption={(input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}>
            {allIngredients.filter(ing => !recipe.some(item => item.ingredient.id === ing.id)).map(ing => (<Option key={ing.id} value={ing.id}>{ing.name}</Option>))}
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddIngredient} disabled={!selectedIngredient}>Añadir</Button>
        </Space>
        <Table columns={columns} dataSource={recipe} pagination={false} rowKey="key" />
      </Spin>
    </Modal>
  );
};

export default RecipeManagementModal;