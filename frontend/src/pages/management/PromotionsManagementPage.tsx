import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Popconfirm,
  Space,
  Card,
  Typography,
  DatePicker,
  Select,
  Upload,
  Image,
  InputNumber,
  Switch,
  Tag,
  notification,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { getPromotions, createPromotion, updatePromotion, deletePromotion, uploadPromotionImage } from '../../services/promotions';
import { getProducts } from '../../services/api';
import { Promotion, CreatePromotionDto, UpdatePromotionDto } from '../../types/promotion';
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
      setPromotions(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      notification.error({ message: 'Error', description: 'No se pudieron cargar las promociones.' });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      notification.error({ message: 'Error al cargar productos', description: 'No se pudieron cargar los productos para el formulario.' });
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
        productIds: promotion.products?.map(p => p.id) || [],
      });
      if (promotion.imageUrl) {
        setFileList([{ uid: '-1', name: 'image.png', status: 'done', url: promotion.imageUrl }]);
      }
    } else {
      setEditingPromotion(null);
      form.resetFields();
      form.setFieldsValue({ isActive: true });
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
      const payload: UpdatePromotionDto = {
        name: values.name,
        description: values.description,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        productIds: values.productIds,
        discountPercentage: values.discountPercentage,
        isActive: values.isActive,
      };

      let savedPromotion: Promotion;

      if (editingPromotion) {
        savedPromotion = await updatePromotion(editingPromotion.id, payload);
        notification.success({ message: 'Éxito', description: 'Promoción actualizada correctamente.' });
      } else {
        savedPromotion = await createPromotion(payload as CreatePromotionDto);
        notification.success({ message: 'Éxito', description: 'Promoción creada correctamente.' });
      }

      if (fileList.length > 0 && fileList[0].originFileObj) {
        await uploadPromotionImage(savedPromotion.id, fileList[0].originFileObj);
        notification.info({ message: 'Información', description: 'Imagen de la promoción actualizada.' });
      }

      fetchPromotions();
      handleCancel();
    } catch (error: any) {
      notification.error({ message: 'Error al guardar', description: error.response?.data?.message || 'Ocurrió un error inesperado.' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePromotion(id);
      notification.success({ message: 'Éxito', description: 'Promoción eliminada correctamente.' });
      fetchPromotions();
    } catch (error: any) {
      notification.error({ message: 'Error al eliminar', description: error.response?.data?.message || 'Error al eliminar la promoción.' });
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
      title: 'Descuento',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      render: (discount: number) => (discount ? `${discount}%` : 'N/A'),
    },
    {
      title: 'Vigencia',
      key: 'validity',
      render: (_: any, record: Promotion) => `${dayjs(record.startDate).format('DD/MM/YYYY')} - ${dayjs(record.endDate).format('DD/MM/YYYY')}`,
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Activa' : 'Inactiva'}</Tag>
      ),
    },
    {
      title: 'Productos',
      key: 'products',
      render: (_: any, record: Promotion) => record.products?.map((p) => p.name).join(', ') || 'Todos los productos',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Promotion) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm title="¿Estás seguro de eliminar esta promoción?" onConfirm={() => handleDelete(record.id)} okText="Sí" cancelText="No">
            <Button icon={<DeleteOutlined />} danger />
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
        <Form form={form} layout="vertical" name="promotion_form" initialValues={{ isActive: true }}>
          <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'El nombre es obligatorio.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descripción" rules={[{ required: true, message: 'La descripción es obligatoria.' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="dateRange" label="Vigencia" rules={[{ required: true, message: 'El rango de fechas es obligatorio.' }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="discountPercentage" label="Porcentaje de Descuento (%)">
            <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
          </Form.Item>
          <Form.Item name="isActive" label="Activa" valuePropName="checked">
            <Switch />
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