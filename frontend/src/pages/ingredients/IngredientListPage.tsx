import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Spin, Alert, Modal, notification, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ShoppingCartOutlined, ExperimentOutlined, ToolOutlined } from '@ant-design/icons';
import { getIngredients, deleteIngredient } from '../../services/api';
import { Ingredient } from '../../types/product';
import IngredientForm from '../../components/IngredientForm';
import InventoryOperationModal, { OperationType } from '../../components/inventory/InventoryOperationModal';

const { Title } = Typography;

const IngredientListPage: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [isOperationModalOpen, setIsOperationModalOpen] = useState(false);
  const [operationType, setOperationType] = useState<OperationType>('purchase');

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const data = await getIngredients();
      setIngredients(data);
    } catch (err) {
      setError('No se pudieron cargar los ingredientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleAdd = () => {
    setSelectedIngredient(null);
    setIsFormOpen(true);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '¿Seguro que quieres eliminar este ingrediente?',
      content: 'Esta acción no se puede deshacer y podría afectar a las recetas existentes.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteIngredient(id);
          notification.success({ message: 'Ingrediente eliminado' });
          fetchIngredients();
        } catch (err) {
          notification.error({ message: 'Error al eliminar el ingrediente' });
        }
      },
    });
  };

  const handleFormClose = (shouldReload: boolean) => {
    setIsFormOpen(false);
    if (shouldReload) {
      fetchIngredients();
    }
  };

  const handleOpenOperationModal = (type: OperationType) => {
    setOperationType(type);
    setIsOperationModalOpen(true);
  };

  const handleOperationModalClose = (shouldReload: boolean) => {
    setIsOperationModalOpen(false);
    if (shouldReload) {
      fetchIngredients();
    }
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Ingredient, b: Ingredient) => a.name.localeCompare(b.name),
    },
    {
      title: 'Stock Actual',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      render: (stock: number, record: Ingredient) => {
        const isLowStock = stock <= record.lowStockThreshold;
        return <Tag color={isLowStock ? 'red' : 'blue'}>{`${stock} ${record.unit}`}</Tag>;
      },
      sorter: (a: Ingredient, b: Ingredient) => a.stockQuantity - b.stockQuantity,
    },
    {
      title: 'Unidad',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: 'Umbral de Stock Bajo',
      dataIndex: 'lowStockThreshold',
      key: 'lowStockThreshold',
      render: (threshold: number, record: Ingredient) => `${threshold} ${record.unit}`,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Ingredient) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Editar</Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)}>Eliminar</Button>
        </Space>
      ),
    },
  ];

  if (loading) return <Spin tip="Cargando ingredientes..." size="large" />;
  if (error) return <Alert message={error} type="error" showIcon />;

  return (
    <>
      <Title level={2}>Gestión de Inventario</Title>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Añadir Ingrediente
        </Button>
        <Button icon={<ShoppingCartOutlined />} onClick={() => handleOpenOperationModal('purchase')}>
          Registrar Compra
        </Button>
        <Button icon={<ExperimentOutlined />} danger onClick={() => handleOpenOperationModal('waste')}>
          Registrar Merma
        </Button>
        <Button icon={<ToolOutlined />} onClick={() => handleOpenOperationModal('adjustment')}>
          Ajustar Stock
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={ingredients}
        rowKey="id"
        loading={loading}
      />
      {isFormOpen && (
        <IngredientForm
          open={isFormOpen}
          onClose={handleFormClose}
          ingredient={selectedIngredient}
        />
      )}
      {isOperationModalOpen && (
        <InventoryOperationModal
          open={isOperationModalOpen}
          onClose={handleOperationModalClose}
          operationType={operationType}
          ingredients={ingredients}
        />
      )}
    </>
  );
};

export default IngredientListPage;