import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Spin,
  Alert,
  Typography,
  Button,
  Modal,
  notification,
  Form,
  Input,
  Space,
  Popconfirm,
  Select,
  InputNumber,
  Switch,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
  getPreparationZones,
} from '../../services/api';
import { Product, CreateProductDto, UpdateProductDto } from '../../types/product';
import { ProductCategory } from '../../types/product-category';
import { PreparationZone } from '../../types/preparation-zone';
import type { ColumnsType } from 'antd/es/table';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const ProductManagementPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [zones, setZones] = useState<PreparationZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, zonesData] = await Promise.all([
        getProducts(),
        getProductCategories(),
        getPreparationZones(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setZones(zonesData);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (product: Product | null) => {
    setEditingProduct(product);
    if (product) {
      form.setFieldsValue({
        ...product,
        categoryId: product.category.id,
        preparationZoneId: product.preparationZone?.id,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isAvailable: true });
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    form.resetFields();
  };

  const handleFormSubmit = async (values: any) => {
    // Si se limpia la selección, el valor es `undefined`. Lo convertimos a `null` para que el backend lo desasigne.
    const preparationZoneId = values.preparationZoneId || null;
    const dto: CreateProductDto | UpdateProductDto = {
      ...values,
      price: Number(values.price),
      preparationZoneId,
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, dto as UpdateProductDto);
        notification.success({ message: 'Producto actualizado con éxito' });
      } else {
        await createProduct(dto as CreateProductDto);
        notification.success({ message: 'Producto creado con éxito' });
      }
      fetchData();
      handleCancel();
    } catch (err: any) {
      notification.error({
        message: 'Error',
        description: err.response?.data?.message || 'Ocurrió un error al guardar el producto.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      notification.success({ message: 'Producto eliminado con éxito' });
      fetchData();
    } catch (err: any) {
      notification.error({
        message: 'Error al eliminar',
        description: err.response?.data?.message || 'No se pudo eliminar el producto.',
      });
    }
  };

  const columns: ColumnsType<Product> = [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Categoría', dataIndex: ['category', 'name'], key: 'category' },
    { title: 'Precio', dataIndex: 'price', key: 'price', render: (val) => `$${Number(val).toFixed(2)}` },
    {
      title: 'Zona de Preparación',
      dataIndex: ['preparationZone', 'name'],
      key: 'zone',
      render: (name) => name ? <Tag color="blue">{name}</Tag> : <Tag>Sin asignar</Tag>,
    },
    { title: 'Disponible', dataIndex: 'isAvailable', key: 'isAvailable', render: (val) => (val ? 'Sí' : 'No') },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="¿Eliminar este producto?" onConfirm={() => handleDelete(record.id)} okText="Sí" cancelText="No">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) return <Spin tip="Cargando productos..." size="large" style={{ display: 'block', marginTop: 50 }} />;

  return (
    <>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <Title level={2}>Gestión de Productos</Title>
            <Paragraph>Crea, edita y organiza los productos de tu menú.</Paragraph>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
            Crear Producto
          </Button>
        </div>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />}
        <Table columns={columns} dataSource={products} rowKey="id" />
      </Card>

      <Modal
        title={editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item name="name" label="Nombre del Producto" rules={[{ required: true, message: 'El nombre es obligatorio' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descripción">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="price" label="Precio" rules={[{ required: true, message: 'El precio es obligatorio' }]}>
            <InputNumber style={{ width: '100%' }} prefix="$" min={0} />
          </Form.Item>
          <Form.Item name="categoryId" label="Categoría" rules={[{ required: true, message: 'Selecciona una categoría' }]}>
            <Select placeholder="Seleccionar categoría">
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="preparationZoneId" label="Zona de Preparación">
            <Select placeholder="Asignar a una zona (opcional)" allowClear>
              {zones.map((zone) => (
                <Option key={zone.id} value={zone.id}>{zone.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="isAvailable" label="Disponible para la venta" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={handleCancel}>Cancelar</Button>
              <Button type="primary" htmlType="submit">
                Guardar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ProductManagementPage;