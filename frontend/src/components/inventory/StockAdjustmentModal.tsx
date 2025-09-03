import React, { useState, useEffect, FC } from 'react';
import { Modal, Button, Table, Select, InputNumber, Input, message, Spin, Space, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getIngredients, adjustStock } from '../../services/ingredients';
import { Ingredient } from '../../types/product';

const { Option } = Select;

interface AdjustmentItem {
  key: string;
  ingredientId: string;
  ingredientName: string;
  currentStock: number;
  unit: string;
  newQuantity: number;
  reason: string;
}

interface StockAdjustmentModalProps {
  visible: boolean;
  onClose: (refreshNeeded: boolean) => void;
}

const StockAdjustmentModal: FC<StockAdjustmentModalProps> = ({ visible, onClose }) => {
  const [adjustmentItems, setAdjustmentItems] = useState<AdjustmentItem[]>([]);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (visible) {
      const fetchIngredientsData = async () => {
        setLoading(true);
        try {
          const ingredientsData = await getIngredients();
          setAllIngredients(ingredientsData);
        } catch (error) {
          message.error('Error al cargar la lista de ingredientes.');
        } finally {
          setLoading(false);
        }
      };
      fetchIngredientsData();
    } else {
      setAdjustmentItems([]);
      setSelectedIngredient(undefined);
    }
  }, [visible]);

  const handleValueChange = (key: string, field: keyof AdjustmentItem, value: any) => {
    const newItems = adjustmentItems.map(item =>
      item.key === key ? { ...item, [field]: value } : item
    );
    setAdjustmentItems(newItems);
  };

  const handleRemoveItem = (key: string) => {
    setAdjustmentItems(adjustmentItems.filter(item => item.key !== key));
  };

  const handleAddItem = () => {
    if (selectedIngredient) {
      const ingredientToAdd = allIngredients.find(ing => ing.id === selectedIngredient);
      if (ingredientToAdd && !adjustmentItems.some(item => item.ingredientId === ingredientToAdd.id)) {
        setAdjustmentItems([
          ...adjustmentItems,
          {
            key: ingredientToAdd.id,
            ingredientId: ingredientToAdd.id,
            ingredientName: ingredientToAdd.name,
            currentStock: ingredientToAdd.stockQuantity,
            unit: ingredientToAdd.unit,
            newQuantity: ingredientToAdd.stockQuantity,
            reason: '',
          },
        ]);
        setSelectedIngredient(undefined);
      } else {
        message.warning('El ingrediente ya está en la lista de ajuste.');
      }
    }
  };

  const handleSave = async () => {
    if (adjustmentItems.length === 0) {
      message.warning('Añade al menos un ingrediente para ajustar el stock.');
      return;
    }
    if (adjustmentItems.some(item => item.newQuantity < 0)) {
      message.error('La nueva cantidad de stock no puede ser negativa.');
      return;
    }
    if (adjustmentItems.some(item => !item.reason.trim())) {
      message.error('Todos los ajustes deben tener un motivo.');
      return;
    }

    setLoading(true);
    try {
      const itemsToSave = adjustmentItems.map(({ ingredientId, newQuantity, reason }) => ({
        ingredientId,
        newQuantity,
        reason,
      }));
      await adjustStock(itemsToSave);
      message.success('Stock ajustado con éxito');
      onClose(true);
    } catch (error) {
      message.error('Error al ajustar el stock');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Ingrediente', dataIndex: 'ingredientName', key: 'name' },
    { title: 'Stock Actual', dataIndex: 'currentStock', key: 'currentStock', render: (text: number, record: AdjustmentItem) => `${text} ${record.unit}` },
    {
      title: 'Nueva Cantidad',
      dataIndex: 'newQuantity',
      key: 'newQuantity',
      render: (text: number, record: AdjustmentItem) => (
        <InputNumber
          min={0}
          step={0.1}
          value={text}
          onChange={(value) => handleValueChange(record.key, 'newQuantity', value || 0)}
          addonAfter={record.unit}
          style={{ width: '150px' }}
        />
      ),
    },
    {
      title: 'Motivo del Ajuste',
      dataIndex: 'reason',
      key: 'reason',
      render: (text: string, record: AdjustmentItem) => (
        <Input
          value={text}
          onChange={(e) => handleValueChange(record.key, 'reason', e.target.value)}
          placeholder="Ej: Conteo físico, error de ingreso"
        />
      ),
    },
    {
      title: 'Acción',
      key: 'action',
      render: (_: any, record: AdjustmentItem) => (
        <Popconfirm title="¿Quitar este item?" onConfirm={() => handleRemoveItem(record.key)}>
          <Button icon={<DeleteOutlined />} danger type="link" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal title="Ajuste de Stock de Ingredientes" open={visible} onOk={handleSave} onCancel={() => onClose(false)} width={900} confirmLoading={loading} okText="Guardar Ajuste" cancelText="Cancelar">
      <Spin spinning={loading && allIngredients.length === 0}>
        <Space style={{ marginBottom: 16 }}>
          <Select
            showSearch
            style={{ width: 300 }}
            placeholder="Seleccionar un ingrediente"
            optionFilterProp="children"
            onChange={(value) => setSelectedIngredient(value)}
            value={selectedIngredient}
            filterOption={(input, option) =>
              (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
            }
          >
            {allIngredients
              .filter(ing => !adjustmentItems.some(item => item.ingredientId === ing.id))
              .map(ing => (
                <Option key={ing.id} value={ing.id}>{ing.name}</Option>
              ))}
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem} disabled={!selectedIngredient}>
            Añadir a la lista
          </Button>
        </Space>
        <Table columns={columns} dataSource={adjustmentItems} pagination={false} rowKey="key" />
      </Spin>
    </Modal>
  );
};

export default StockAdjustmentModal;