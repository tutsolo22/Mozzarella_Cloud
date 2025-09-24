import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
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
  Table,
  Tag,
  Select,
} from 'antd';
import { PlusOutlined, DeleteOutlined, KeyOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { getApiKeysForTenant, upsertApiKey, deleteApiKey, ExternalService, ApiKey, UpsertApiKeyDto } from '../../services/api';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const TenantApiKeysPage: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const data = await getApiKeysForTenant(tenantId);
      setApiKeys(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudieron cargar las claves de API.');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleFormSubmit = async (values: UpsertApiKeyDto) => {
    if (!tenantId) return;
    try {
      await upsertApiKey(tenantId, values);
      notification.success({ message: 'Clave de API guardada con éxito' });
      fetchData();
      handleCancel();
    } catch (err: any) {
      notification.error({
        message: 'Error al guardar',
        description: err.response?.data?.message || 'Ocurrió un error al guardar la clave.',
      });
    }
  };

  const handleDelete = async (keyId: string) => {
    if (!tenantId) return;
    try {
      await deleteApiKey(tenantId, keyId);
      notification.success({ message: 'Clave de API eliminada con éxito' });
      fetchData();
    } catch (err: any) {
      notification.error({
        message: 'Error al eliminar',
        description: err.response?.data?.message || 'No se pudo eliminar la clave.',
      });
    }
  };

  const columns: ColumnsType<ApiKey> = [
    {
      title: 'Servicio',
      dataIndex: 'serviceIdentifier',
      key: 'service',
      render: (service: string) => <Tag color="blue">{service}</Tag>,
    },
    { title: 'Última Actualización', dataIndex: 'updatedAt', key: 'updatedAt', render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm') },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Popconfirm title="¿Eliminar esta clave?" onConfirm={() => handleDelete(record.id)} okText="Sí" cancelText="No">
          <Button icon={<DeleteOutlined />} danger />
        </Popconfirm>
      ),
    },
  ];

  if (loading) return <Spin tip="Cargando..." size="large" />;

  return (
    <>
      <Card>
        <Button type="link" icon={<ArrowLeftOutlined />} style={{ padding: 0, marginBottom: 16 }}>
          <Link to="/super-admin/tenants">Volver a Tenants</Link>
        </Button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <Title level={2}><KeyOutlined /> Gestión de API Keys</Title>
            <Paragraph>Administra las claves de API para servicios externos de este tenant.</Paragraph>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenModal}>
            Añadir / Actualizar Clave
          </Button>
        </div>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />}
        <Table columns={columns} dataSource={apiKeys} rowKey="id" />
      </Card>

      <Modal
        title="Añadir / Actualizar Clave de API"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item name="serviceIdentifier" label="Servicio" rules={[{ required: true, message: 'Selecciona un servicio' }]}>
            <Select placeholder="Seleccionar servicio">
              <Option value={ExternalService.INVOICING}>Facturación (INVOICING)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="key" label="Clave de API" rules={[{ required: true, message: 'La clave es obligatoria' }]}>
            <Input.Password placeholder="Pega la clave de API aquí" />
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

export default TenantApiKeysPage;