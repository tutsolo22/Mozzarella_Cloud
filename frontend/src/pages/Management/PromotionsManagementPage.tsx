import React, { useState, useEffect, useCallback } from 'react';
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
  DatePicker,
  Select,
  Upload,
  Image,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { getPromotions, createPromotion, updatePromotion, deletePromotion, uploadPromotionImage } from '../../services/promotions';
import { getProducts } from '../../services/products';
import { Promotion } from '../../types/promotion';
import { Product } from '../../types/product';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const PromotionsManagementPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPromotions();
      setPromotions(data);
    } catch (error) {
      message.error('Error al cargar las promociones');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await getProducts({ page: 1, limit: 1000 }); // Fetch all products
      setProducts(data.items);
    } catch (error) {
      message.error('Error al cargar los productos');
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
    fetchProducts();
  }, [fetchPromotions, fetchProducts]);

  const showModal = (promotion?: Promotion) => {
    if (promotion) {
      setEditingPromotion(promotion);
      form.setFieldsValue({
        ...promotion,
        dateRange: [dayjs(promotion.startDate), dayjs(promotion.endDate)],
        productIds: promotion.products.map(p => p.id),
      });
      if (promotion.imageUrl) {
        setFileList([{ uid: '-1', name: 'image.png', status: 'done', url: promotion.imageUrl }]);
      }
    } else {
      setEditingPromotion(null);
      form.resetFields();
      setFileList([]);
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingPromotion(null);
    form.resetFields();
    setFileList([]);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        description: values.description,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        productIds: values.productIds,
      };

      let savedPromotion: Promotion;

      if (editingPromotion) {
        savedPromotion = await updatePromotion(editingPromotion.id, payload);
        message.success('Promoción actualizada con éxito');
      } else {
        savedPromotion = await createPromotion(payload);
        message.success('Promoción creada con éxito');
      }

      if (fileList.length > 0 && fileList[0].originFileObj) {
        await uploadPromotionImage(savedPromotion.id, fileList[0].originFileObj);
        message.success('Imagen de la promoción subida con éxito.');
      }

      fetchPromotions();
      handleCancel();
    } catch (error) {
      message.error('Ocurrió un error al guardar la promoción');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePromotion(id);
      message.success('Promoción eliminada con éxito');
      fetchPromotions();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error al eliminar la promoción.');
    }
  };

  const columns = [
    {
      title: 'Imagen',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (url: string) => url ? <Image src={url} width={50} /> : 'N/A',
    },
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    {
      title: 'Vigencia',
      key: 'validity',
      render: (_: any, record: Promotion) => `${dayjs(record.startDate).format('DD/MM/YYYY')} - ${dayjs(record.endDate).format('DD/MM/YYYY')}`,
    },
    {
      title: 'Productos',
      key: 'products',
      render: (_: any, record: Promotion) => record.products.map(p => p.name).join(', '),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Promotion) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>Editar</Button>
          <Popconfirm title="¿Estás seguro de eliminar esta promoción?" onConfirm={() => handleDelete(record.id)} okText="Sí" cancelText="No">
            <Button icon={<DeleteOutlined />} danger>Eliminar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Title level={2}>Gestión de Promociones</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 16 }}>
        Crear Promoción
      </Button>
      <Table columns={columns} dataSource={promotions} rowKey="id" loading={loading} />
      <Modal title={editingPromotion ? 'Editar Promoción' : 'Crear Promoción'} open={isModalOpen} onOk={handleOk} onCancel={handleCancel} width={800} destroyOnClose>
        <Form form={form} layout="vertical" name="promotion_form">
          <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'El nombre es obligatorio.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descripción" rules={[{ required: true, message: 'La descripción es obligatoria.' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="dateRange" label="Vigencia" rules={[{ required: true, message: 'El rango de fechas es obligatorio.' }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="productIds" label="Productos Incluidos" rules={[{ required: true, message: 'Debes seleccionar al menos un producto.' }]}>
            <Select
              mode="multiple"
              allowClear
              placeholder="Selecciona los productos"
              options={products.map(p => ({ label: p.name, value: p.id }))}
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item label="Imagen de la Promoción">
            <Upload
              listType="picture"
              fileList={fileList}
              beforeUpload={() => false} // Prevent auto-upload
              onChange={({ fileList: newFileList }) => setFileList(newFileList.slice(-1))} // Only allow one file
              onRemove={() => setFileList([])}
            >
              <Button icon={<UploadOutlined />}>Seleccionar Imagen</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PromotionsManagementPage;