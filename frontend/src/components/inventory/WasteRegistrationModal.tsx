import React, { useState, useEffect, FC } from 'react';
import { Modal, Button, Table, Select, InputNumber, Input, message, Spin, Space, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getIngredients, registerWaste } from '../../services/ingredients';
import { Ingredient } from '../../types/product';

const { Option } = Select;

interface WasteItem {
  key: string;
  ingredientId: string;
  ingredientName: string;
  unit: string;
  quantity: number;
  reason: string;
}

interface WasteRegistrationModalProps {
  visible: boolean;
  onClose: (refreshNeeded: boolean) => void;
}

const WasteRegistrationModal: FC<WasteRegistrationModalProps> = ({ visible, onClose }) => {
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([]);
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
      setWasteItems([]);
      setSelectedIngredient(undefined);
    }
  }, [visible]);

  const handleValueChange = (key: string, field: keyof WasteItem, value: any) => {
    const newItems = wasteItems.map(item =>
      item.key === key ? { ...item, [field]: value } : item
    );
    setWasteItems(newItems);
  };

  const handleRemoveItem = (key: string) => {
    setWasteItems(wasteItems.filter(item => item.key !== key));
  };

  const handleAddItem = () => {
    if (selectedIngredient) {
      const ingredientToAdd = allIngredients.find(ing => ing.id === selectedIngredient);
      if (ingredientToAdd && !wasteItems.some(item => item.ingredientId === ingredientToAdd.id)) {
        setWasteItems([
          ...wasteItems,
          {
            key: ingredientToAdd.id,
            ingredientId: ingredientToAdd.id,
            ingredientName: ingredientToAdd.name,
            unit: ingredientToAdd.unit,
            quantity: 0,
            reason: '',
          },
        ]);
        setSelectedIngredient(undefined);
      } else {
        message.warning('El ingrediente ya está en la lista.');
      }
    }
  };

  const handleSave = async () => {
    if (wasteItems.length === 0) {
      message.warning('Añade al menos un ingrediente para registrar la merma.');
      return;
    }
    if (wasteItems.some(item => item.quantity <= 0)) {
      message.error('La cantidad de merma debe ser mayor que cero.');
      return;
    }

    setLoading(true);
    try {
      const itemsToSave = wasteItems.map(({ ingredientId, quantity, reason }) => ({
        ingredientId,
        quantity,
        reason,
      }));
      await registerWaste(itemsToSave);
      message.success('Merma registrada con éxito');
      onClose(true);
    } catch (error) {
      message.error('Error al registrar la merma');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Ingrediente', dataIndex: 'ingredientName', key: 'name' },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text: number, record: WasteItem) => (
        <InputNumber
          min={0}
          step={0.1}
          value={text}
          onChange={(value) => handleValueChange(record.key, 'quantity', value || 0)}
          addonAfter={record.unit}
          style={{ width: '150px' }}
        />
      ),
    },
    {
      title: 'Motivo',
      dataIndex: 'reason',
      key: 'reason',
      render: (text: string, record: WasteItem) => (
        <Input
          value={text}
          onChange={(e) => handleValueChange(record.key, 'reason', e.target.value)}
          placeholder="Ej: Mal estado, caducado"
        />
      ),
    },
    {
      title: 'Acción',
      key: 'action',
      render: (_: any, record: WasteItem) => (
        <Popconfirm title="¿Quitar este item?" onConfirm={() => handleRemoveItem(record.key)}>
          <Button icon={<DeleteOutlined />} danger type="link" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal title="Registrar Merma de Ingredientes" open={visible} onOk={handleSave} onCancel={() => onClose(false)} width={800} confirmLoading={loading} okText="Guardar Merma" cancelText="Cancelar">
      <Spin spinning={loading && allIngredients.length === 0}>
        <Space style={{ marginBottom: 16 }}>
          <Select showSearch style={{ width: 300 }} placeholder="Seleccionar un ingrediente" optionFilterProp="children" onChange={(value) => setSelectedIngredient(value)} value={selectedIngredient} filterOption={(input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}>
            {allIngredients.filter(ing => !wasteItems.some(item => item.ingredientId === ing.id)).map(ing => (<Option key={ing.id} value={ing.id}>{ing.name}</Option>))}
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem} disabled={!selectedIngredient}>Añadir a la lista</Button>
        </Space>
        <Table columns={columns} dataSource={wasteItems} pagination={false} rowKey="key" />
      </Spin>
    </Modal>
  );
};

export default WasteRegistrationModal;