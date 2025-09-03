import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  message,
  Popconfirm,
  Switch,
  Space,
  Modal,
  Form,
  Input,
  Typography,
  Card,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import {
  getAllProductCategories,
  deleteProductCategory,
  restoreProductCategory,
  createProductCategory,
  updateProductCategory,
} from '../../services/productCategories';
import { ProductCategory, ProductCategoryDto } from '../../types/product';

const { Title } = Typography;

const ProductCategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);

  const [form] = Form.useForm();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllProductCategories(showDeleted);
      setCategories(data);
    } catch (error) {
      message.error('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  }, [showDeleted]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProductCategory(id);
      message.success('Categoría eliminada con éxito');
      fetchCategories();
    } catch (error) {
      message.error('Error al eliminar la categoría');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreProductCategory(id);
      message.success('Categoría restaurada con éxito');
      fetchCategories();
    } catch (error) {
      message.error('Error al restaurar la categoría');
    }
  };

  const showModal = (category: ProductCategory | null = null) => {
    setEditingCategory(category);
    form.setFieldsValue(category || { name: '', description: '' });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields() as ProductCategoryDto;
      if (editingCategory) {
        await updateProductCategory(editingCategory.id, values);
        message.success('Categoría actualizada con éxito');
      } else {
        await createProductCategory(values);
        message.success('Categoría creada con éxito');
      }
      handleCancel();
      fetchCategories();
    } catch (error) {
      message.error('Error al guardar la categoría');
    }
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: ProductCategory) => (
        <Space size="middle">
          {record.deletedAt ? (
            <Popconfirm
              title="¿Restaurar esta categoría?"
              onConfirm={() => handleRestore(record.id)}
              okText="Sí"
              cancelText="No"
            >
              <Button icon={<UndoOutlined />} type="link">Restaurar</Button>
            </Popconfirm>
          ) : (
            <>
              <Button icon={<EditOutlined />} type="link" onClick={() => showModal(record)}>Editar</Button>
              <Popconfirm
                title="¿Eliminar esta categoría?"
                description="Los productos asociados no se eliminarán."
                onConfirm={() => handleDelete(record.id)}
                okText="Sí"
                cancelText="No"
              >
                <Button icon={<DeleteOutlined />} type="link" danger>Eliminar</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Title level={2}>Gestión de Categorías de Productos</Title>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Crear Categoría
        </Button>
        <Space>
          <span>Mostrar eliminadas</span>
          <Switch checked={showDeleted} onChange={setShowDeleted} />
        </Space>
      </Space>
      <Table
        dataSource={categories}
        columns={columns}
        loading={loading}
        rowKey="id"
        rowClassName={(record) => (record.deletedAt ? 'deleted-row' : '')}
      />
      <Modal
        title={editingCategory ? 'Editar Categoría' : 'Crear Categoría'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" name="categoryForm">
          <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'El nombre es obligatorio' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descripción">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ProductCategoryManagementPage;