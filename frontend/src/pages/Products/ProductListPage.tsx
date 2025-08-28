import React, { useState, useEffect } from 'react';
import { Table, Card, Spin, Alert, Typography, Button, Space, Modal, notification, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getProducts, deleteProduct } from '../../services/api';
import { Product } from '../../types/product';
import ProductForm from '../../components/ProductForm';

const { Title } = Typography;

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError('No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '¿Seguro que quieres eliminar este producto?',
      content: 'Esta acción no se puede deshacer.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteProduct(id);
          notification.success({ message: 'Producto eliminado' });
          fetchProducts();
        } catch (err) {
          notification.error({ message: 'Error al eliminar' });
        }
      },
    });
  };

  const handleModalClose = (shouldReload: boolean) => {
    setIsModalOpen(false);
    if (shouldReload) {
      fetchProducts();
    }
  };

  const columns = [
    {
      title: 'Imagen',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (url: string) => <Image width={60} src={url} fallback="/placeholder.png" />,
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Product, b: Product) => a.name.localeCompare(b.name),
    },
    {
      title: 'Categoría',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
      sorter: (a: Product, b: Product) => a.price - b.price,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Product) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Editar</Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)}>Eliminar</Button>
        </Space>
      ),
    },
  ];

  if (loading) return <Spin tip="Cargando productos..." size="large" />;
  if (error) return <Alert message={error} type="error" showIcon />;

  return (
    <>
      <Card>
        <Title level={2}>Gestión de Productos</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ marginBottom: 16 }}>
          Añadir Producto
        </Button>
        <Table columns={columns} dataSource={products} rowKey="id" />
      </Card>
      {isModalOpen && (
        <ProductForm
          open={isModalOpen}
          onClose={handleModalClose}
          product={selectedProduct}
        />
      )}
    </>
  );
};

export default ProductListPage;