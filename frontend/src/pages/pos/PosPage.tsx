import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Spin, Alert, Card, Input, List, Button, Badge, notification, Empty, Modal } from 'antd';
import { getProducts, createOrder } from '../../services/api';
import { Product } from '../../types/product';
import { CreateOrderItem } from '../../types/order';
import { PlusOutlined, MinusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;

const POSPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CreateOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [currentItemForNote, setCurrentItemForNote] = useState<CreateOrderItem | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        setError('No se pudieron cargar los productos.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  const handleSearch = (value: string) => {
    const lowercasedValue = value.toLowerCase();
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(lowercasedValue) ||
      p.category?.name.toLowerCase().includes(lowercasedValue)
    );
    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { productId: product.id, name: product.name, price: product.price, quantity: 1, notes: '' }];
    });
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      setCart(prevCart => prevCart.filter(item => item.productId !== productId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleOpenNoteModal = (item: CreateOrderItem) => {
    setCurrentItemForNote(item);
    setNoteText(item.notes || '');
    setIsNoteModalVisible(true);
  };

  const handleSaveNote = () => {
    if (!currentItemForNote) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === currentItemForNote.productId ? { ...item, notes: noteText } : item
      )
    );
    setIsNoteModalVisible(false);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      notification.warning({ message: 'El carrito está vacío.' });
      return;
    }
    setSubmitting(true);
    try {
      const orderItems = cart.map(({ productId, quantity, notes }) => ({ productId, quantity, notes }));
      await createOrder(orderItems);
      notification.success({ message: 'Pedido creado con éxito' });
      setCart([]);
    } catch (err) {
      notification.error({ message: 'Error al crear el pedido' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spin tip="Cargando productos..." size="large" />;
  if (error) return <Alert message={error} type="error" showIcon />;

  return (
    <Row gutter={16} style={{ height: 'calc(100vh - 150px)' }}>
      {/* Product Selection Column */}
      <Col span={14} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Title level={3}>Punto de Venta</Title>
        <Search
          placeholder="Buscar productos por nombre o categoría..."
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ marginBottom: 16 }}
          allowClear
        />
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
          <Row gutter={[16, 16]}>
            {filteredProducts.map(product => (
              <Col key={product.id} span={8}>
                <Card
                  hoverable
                  onClick={() => handleAddToCart(product)}
                  cover={<img alt={product.name} src={product.imageUrl || '/placeholder.png'} style={{ height: 120, objectFit: 'cover' }} />}
                >
                  <Card.Meta title={product.name} description={`$${product.price.toFixed(2)}`} />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Col>

      {/* Cart Column */}
      <Col span={10} style={{ display: 'flex', flexDirection: 'column', height: '100%', borderLeft: '1px solid #f0f0f0', paddingLeft: '16px' }}>
        <Title level={3}>Pedido Actual <Badge count={totalItems} color="blue" /></Title>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <Empty description="El carrito está vacío" style={{ marginTop: '50%' }}/>
          ) : (
            <List
              dataSource={cart}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button icon={<MinusOutlined />} size="small" onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)} />,
                    <Text strong>{item.quantity}</Text>,
                    <Button icon={<PlusOutlined />} size="small" onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)} />,
                    <Button icon={<EditOutlined />} size="small" onClick={() => handleOpenNoteModal(item)} title="Añadir nota" />,
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleUpdateQuantity(item.productId, 0)} />,
                  ]}
                >
                  <List.Item.Meta
                    title={<Text>{item.name}</Text>}
                    description={<><Text type="secondary">${(item.price * item.quantity).toFixed(2)}</Text>{item.notes && <><br /><Text type="warning" italic>Nota: {item.notes}</Text></>}</>}
                  />
                </List.Item>
              )}
            />
          )}
        </div>
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
          <Title level={4}>Total: ${totalAmount.toFixed(2)}</Title>
          <Button type="primary" block size="large" onClick={handleSubmitOrder} loading={submitting} disabled={cart.length === 0}>
            Confirmar Pedido
          </Button>
        </div>
      </Col>
      <Modal
        title={`Añadir nota para ${currentItemForNote?.name}`}
        open={isNoteModalVisible}
        onOk={handleSaveNote}
        onCancel={() => setIsNoteModalVisible(false)}
        okText="Guardar Nota"
        cancelText="Cancelar"
      >
        <Input.TextArea
          rows={3}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Ej: sin cebolla, bien cocido..."
        />
      </Modal>
    </Row>
  );
};

export default POSPage;