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
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getPreparationZones, createPreparationZone, updatePreparationZone, deletePreparationZone } from '../../services/api';
import { PreparationZone, CreatePreparationZoneDto, UpdatePreparationZoneDto } from '../../types/preparation-zone';
import type { ColumnsType } from 'antd/es/table';

const { Title, Paragraph } = Typography;

const PreparationZonesPage: React.FC = () => {
  const [zones, setZones] = useState<PreparationZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<PreparationZone | null>(null);
  const [form] = Form.useForm();

  const fetchZones = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPreparationZones();
      setZones(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudieron cargar las zonas de preparación. Asegúrate de tener una sucursal seleccionada.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const handleOpenModal = (zone: PreparationZone | null) => {
    setEditingZone(zone);
    form.setFieldsValue(zone ? { name: zone.name } : { name: '' });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingZone(null);
    form.resetFields();
  };

  const handleFormSubmit = async (values: { name: string }) => {
    try {
      if (editingZone) {
        await updatePreparationZone(editingZone.id, values as UpdatePreparationZoneDto);
        notification.success({ message: 'Zona actualizada con éxito' });
      } else {
        await createPreparationZone(values as CreatePreparationZoneDto);
        notification.success({ message: 'Zona creada con éxito' });
      }
      fetchZones();
      handleCancel();
    } catch (err: any) {
      notification.error({
        message: 'Error',
        description: err.response?.data?.message || 'Ocurrió un error al guardar la zona.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePreparationZone(id);
      notification.success({ message: 'Zona eliminada con éxito' });
      fetchZones();
    } catch (err: any) {
      notification.error({
        message: 'Error al eliminar',
        description: err.response?.data?.message || 'No se pudo eliminar la zona.',
      });
    }
  };

  const columns: ColumnsType<PreparationZone> = [
    {
      title: 'Nombre de la Zona',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)}>
            Editar
          </Button>
          <Popconfirm
            title="¿Eliminar la zona?"
            description="Esta acción no se puede deshacer."
            onConfirm={() => handleDelete(record.id)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
          >
            <Button icon={<DeleteOutlined />} danger>
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) return <Spin tip="Cargando zonas..." size="large" style={{ display: 'block', marginTop: 50 }} />;

  return (
    <>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <Title level={2}>Zonas de Preparación</Title>
            <Paragraph>Organiza los productos en diferentes zonas para optimizar el flujo de trabajo en la cocina.</Paragraph>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
            Crear Zona
          </Button>
        </div>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />}
        <Table columns={columns} dataSource={zones} rowKey="id" />
      </Card>

      <Modal
        title={editingZone ? 'Editar Zona de Preparación' : 'Crear Nueva Zona'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit} initialValues={editingZone || {}}>
          <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'El nombre es obligatorio' }]}>
            <Input placeholder="Ej: Hornos, Barra Fría, Bebidas" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={handleCancel}>Cancelar</Button>
              <Button type="primary" htmlType="submit">
                {editingZone ? 'Guardar Cambios' : 'Crear Zona'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default PreparationZonesPage;
