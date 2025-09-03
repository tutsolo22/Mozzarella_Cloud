import React, { useState, useEffect, FC } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Space,
  Card,
  Typography,
  Upload,
  InputNumber,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import StockAdjustmentModal from '../../components/inventory/StockAdjustmentModal';
import WasteRegistrationModal from '../../components/inventory/WasteRegistrationModal';
import IngredientHistoryModal from '../../components/inventory/IngredientHistoryModal';
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  importIngredients,
  exportIngredients,
} from '../../services/ingredients';
import { Ingredient, CreateIngredientDto } from '../../types/product';
import { downloadCsv } from '../../services/csv';

const { Title } = Typography;

const IngredientManagementPage: FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [historyModalState, setHistoryModalState] = useState<{
    visible: boolean;
    ingredient: Ingredient | null;
  }>({ visible: false, ingredient: null });
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const data = await getIngredients();
      setIngredients(data);
    } catch (error) {
      message.error('Error al cargar los ingredientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const showModal = (ingredient?: Ingredient) => {
    setEditingIngredient(ingredient || null);
    form.setFieldsValue(ingredient || { name: '', stockQuantity: 0, unit: '', lowStockThreshold: 0 });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingIngredient) {
        await updateIngredient(editingIngredient.id, values);
        message.success('Ingrediente actualizado');
      } else {
        await createIngredient(values as CreateIngredientDto);
        message.success('Ingrediente creado');
      }
      fetchIngredients();
      handleCancel();
    } catch (error) {
      message.error('Error al guardar el ingrediente');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteIngredient(id);
      message.success('Ingrediente eliminado');
      fetchIngredients();
    } catch (error) {
      message.error('Error al eliminar el ingrediente');
    }
  };

  const handleExport = async () => {
    try {
      const csvData = await exportIngredients();
      downloadCsv(csvData, 'ingredients.csv');
      message.success('Exportación completada');
    } catch (error) {
      message.error('Error al exportar los datos');
    }
  };

  const handleImport = async (file: File) => {
    try {
      const response = await importIngredients(file);
      message.success(`${response.created} creados, ${response.updated} actualizados.`);
      fetchIngredients();
    } catch (error) {
      message.error('Error al importar el archivo');
    }
    return false; // Evita la subida automática de Ant Design
  };

  const handleWasteModalClose = (refreshNeeded: boolean) => {
    setIsWasteModalOpen(false);
    if (refreshNeeded) {
      fetchIngredients();
    }
  };

  const handleAdjustmentModalClose = (refreshNeeded: boolean) => {
    setIsAdjustmentModalOpen(false);
    if (refreshNeeded) {
      fetchIngredients();
    }
  };

  const openHistoryModal = (ingredient: Ingredient) => {
    setHistoryModalState({ visible: true, ingredient });
  };

  const columns = [
    { title: 'Nombre', dataIndex: 'name', key: 'name', sorter: (a: Ingredient, b: Ingredient) => a.name.localeCompare(b.name) },
    { title: 'Stock', dataIndex: 'stockQuantity', key: 'stockQuantity', sorter: (a: Ingredient, b: Ingredient) => a.stockQuantity - b.stockQuantity },
    { title: 'Unidad', dataIndex: 'unit', key: 'unit' },
    { title: 'Umbral Bajo Stock', dataIndex: 'lowStockThreshold', key: 'lowStockThreshold' },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Ingredient) => (
        <Space size="middle">
          <Button icon={<HistoryOutlined />} onClick={() => openHistoryModal(record)}>
            Historial
          </Button>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>Editar</Button>
          <Popconfirm title="¿Eliminar este ingrediente?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} danger>Eliminar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={2} style={{ margin: 0 }}>Gestión de Ingredientes</Title></Col>
        <Col>
          <Space>
            <Upload beforeUpload={handleImport} showUploadList={false}>
              <Button icon={<UploadOutlined />}>Importar</Button>
            </Upload>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>Exportar</Button>
            <Button onClick={() => setIsAdjustmentModalOpen(true)}>Ajustar Stock</Button>
            <Button onClick={() => setIsWasteModalOpen(true)}>Registrar Merma</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Añadir Ingrediente</Button>
          </Space>
        </Col>
      </Row>
      <Table columns={columns} dataSource={ingredients} rowKey="id" loading={loading} />
      <IngredientHistoryModal
        visible={historyModalState.visible}
        ingredientId={historyModalState.ingredient?.id || null}
        ingredientName={historyModalState.ingredient?.name || null}
        onClose={() => setHistoryModalState({ visible: false, ingredient: null })}
      />
      <StockAdjustmentModal visible={isAdjustmentModalOpen} onClose={handleAdjustmentModalClose} />
      <WasteRegistrationModal visible={isWasteModalOpen} onClose={handleWasteModalClose} />
      <Modal title={editingIngredient ? 'Editar Ingrediente' : 'Crear Ingrediente'} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="stockQuantity" label="Cantidad en Stock" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="unit" label="Unidad (kg, lt, ud)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lowStockThreshold" label="Umbral de Stock Bajo">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default IngredientManagementPage;