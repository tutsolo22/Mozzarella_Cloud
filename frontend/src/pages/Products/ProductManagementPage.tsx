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
  Row,
  Col,
  Typography,
  Switch,
  Tag,
  InputNumber,
  Select,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  DownloadOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { Product, CreateProductDto, UpdateProductDto } from '../../types/product';
import { ProductCategory } from '../../types/product';
import {
  getProducts,
  createProduct,
  updateProduct,
  disableProduct,
  enableProduct,
  exportProducts,
  importProducts,
} from '../../services/products';
import { getProductCategories } from '../../services/productCategories';
import { downloadCsv } from '../../services/csv';
import RecipeManagementModal from '../../components/products/RecipeManagementModal';

const { Title, Text } = Typography;

const ProductManagementPage: FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [recipeModalState, setRecipeModalState] = useState<{
    visible: boolean;
    productId: string | null;
    productName: string;
  }>({ visible: false, productId: null, productName: '' });
  const [loading, setLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [form] = Form.useForm();
  const { Option } = Select;

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(showInactive),
        getProductCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      message.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, [showInactive]);

  const showModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      form.setFieldsValue({
        ...product,
        categoryId: product.category?.id,
      });
    } else {
      setEditingProduct(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const openRecipeModal = (product: Product) => {
    setRecipeModalState({ visible: true, productId: product.id, productName: product.name });
  };

  const handleRecipeModalClose = (refreshNeeded: boolean) => {
    setRecipeModalState({ visible: false, productId: null, productName: '' });
    if (refreshNeeded) {
      fetchProductsAndCategories();
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingProduct) {
        await updateProduct(editingProduct.id, values as UpdateProductDto);
        message.success('Producto actualizado con éxito');
      } else {
        await createProduct(values as CreateProductDto);
        message.success('Producto creado con éxito');
      }
      fetchProductsAndCategories();
      handleCancel();
    } catch (error) {
      message.error('Ocurrió un error al guardar el producto');
    }
  };

  const handleDisable = async (id: string) => {
    try {
      await disableProduct(id);
      message.success('Producto deshabilitado con éxito');
      fetchProductsAndCategories();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error al deshabilitar el producto');
    }
  };

  const handleEnable = async (id: string) => {
    try {
      await enableProduct(id);
      message.success('Producto habilitado con éxito');
      fetchProductsAndCategories();
    } catch (error) {
      message.error('Error al habilitar el producto');
    }
  };

  const handleExport = async () => {
    try {
      const csvData = await exportProducts();
      downloadCsv(csvData, 'products.csv');
      message.success('Exportación de productos completada.');
    } catch (error) {
      message.error('Error al exportar los productos.');
    }
  };

  const handleImport = async (file: File) => {
    try {
      const response = await importProducts(file);
      message.success(`Importación completada: ${response.created} creados, ${response.updated} actualizados.`);
      fetchProductsAndCategories();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al importar el archivo.';
      message.error(errorMessage);
    }
    return false; // Evita la subida automática de Ant Design
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Product, b: Product) => a.name.localeCompare(b.name),
      render: (text: string, record: Product) => (
        <Space>
          {text}
          {record.deletedAt && <Tag color="red">Inactivo</Tag>}
        </Space>
      ),
    },
    {
      title: 'Categoría',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    { title: 'Precio', dataIndex: 'price', key: 'price', render: (val: number) => `$${val.toFixed(2)}` },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Product) => (
        <Space size="middle">
          <Button icon={<BookOutlined />} onClick={() => openRecipeModal(record)}>
            Receta
          </Button>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} disabled={!!record.deletedAt}>
            Editar
          </Button>
          {record.deletedAt ? (
            <Button icon={<CheckCircleOutlined />} onClick={() => handleEnable(record.id)}>
              Habilitar
            </Button>
          ) : (
            <Popconfirm
              title="¿Estás seguro de deshabilitar este producto?"
              description="No se podrá vender ni aparecerá en los menús."
              onConfirm={() => handleDisable(record.id)}
              okText="Sí, deshabilitar"
              cancelText="No"
            >
              <Button icon={<DeleteOutlined />} danger>
                Deshabilitar
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Gestión de Productos</Title>
        </Col>
        <Col>
          <Space>
            <Upload beforeUpload={handleImport} showUploadList={false}>
              <Button icon={<UploadOutlined />}>Importar</Button>
            </Upload>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              Exportar
            </Button>
            <Text>Mostrar inactivos</Text>
            <Switch checked={showInactive} onChange={setShowInactive} />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
              Crear Producto
            </Button>
          </Space>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        rowClassName={(record) => (record.deletedAt ? 'table-row-disabled' : '')}
      />
      <RecipeManagementModal
        productId={recipeModalState.productId}
        productName={recipeModalState.productName}
        visible={recipeModalState.visible}
        onClose={handleRecipeModalClose}
      />
      <Modal
        title={editingProduct ? 'Editar Producto' : 'Crear Producto'}
        visible={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Guardar"
        cancelText="Cancelar"
        destroyOnClose
      >
        <Form form={form} layout="vertical" name="product_form">
          <Form.Item name="name" label="Nombre del Producto" rules={[{ required: true, message: 'Por favor, ingresa el nombre.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descripción" rules={[{ required: true, message: 'Por favor, ingresa la descripción.' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="price" label="Precio" rules={[{ required: true, message: 'Por favor, ingresa el precio.' }]}>
                <InputNumber style={{ width: '100%' }} prefix="$" min={0} precision={2} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="categoryId" label="Categoría" rules={[{ required: true, message: 'Por favor, selecciona una categoría.' }]}>
                <Select placeholder="Seleccionar categoría" allowClear>
                  {categories
                    .filter((cat) => !cat.deletedAt)
                    .map((cat) => <Option key={cat.id} value={cat.id}>{cat.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Card>
  );
};

export default ProductManagementPage;