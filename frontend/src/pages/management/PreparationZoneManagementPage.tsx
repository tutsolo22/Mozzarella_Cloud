import React, { useState, useEffect } from 'react';
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
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getPreparationZones,
  createPreparationZone,
  updatePreparationZone,
  deletePreparationZone,
} from '../../services/preparationZones';
import { PreparationZone, CreatePreparationZoneDto } from '../../types/preparation-zone';

const { Title } = Typography;

const PreparationZoneManagementPage: React.FC = () => {
  const [zones, setZones] = useState<PreparationZone[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<PreparationZone | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchZones = async () => {
    setLoading(true);
    try {
      const data = await getPreparationZones();
      setZones(data);
    } catch (error) {
      message.error('Error al cargar las zonas de preparación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const showModal = (zone?: PreparationZone) => {
    if (zone) {
      setEditingZone(zone);
      form.setFieldsValue(zone);
    } else {
      setEditingZone(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingZone(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingZone) {
        await updatePreparationZone(editingZone.id, values);
        message.success('Zona actualizada con éxito');
      } else {
        await createPreparationZone(values as CreatePreparationZoneDto);
        message.success('Zona creada con éxito');
      }
      fetchZones();
      handleCancel();
    } catch (error) {
      message.error('Ocurrió un error al guardar la zona');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePreparationZone(id);
      message.success('Zona eliminada con éxito');
      fetchZones();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error al eliminar la zona.');
    }
  };

  const columns = [
    { title: 'Nombre', dataIndex: 'name', key: 'name', sorter: (a: PreparationZone, b: PreparationZone) => a.name.localeCompare(b.name) },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: PreparationZone) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>Editar</Button>
          <Popconfirm
            title="¿Estás seguro de eliminar esta zona?"
            description="Esta acción no se puede deshacer."
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>Eliminar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Title level={2}>Gestión de Zonas de Preparación</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 16 }}>
        Crear Zona
      </Button>
      <Table columns={columns} dataSource={zones} rowKey="id" loading={loading} />
      <Modal title={editingZone ? 'Editar Zona' : 'Crear Zona'} open={isModalOpen} onOk={handleOk} onCancel={handleCancel} okText="Guardar" cancelText="Cancelar" destroyOnClose>
        <Form form={form} layout="vertical" name="zone_form">
          <Form.Item name="name" label="Nombre de la Zona" rules={[{ required: true, message: 'Por favor, ingresa el nombre.' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PreparationZoneManagementPage;