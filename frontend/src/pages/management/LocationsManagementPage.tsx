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
  Row,
  Col,
  Typography,
  Switch,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import {
  Location,
  CreateLocationDto,
  UpdateLocationDto,
} from '../../types/location';
import {
  getLocations,
  createLocation,
  updateLocation,
  disableLocation,
  enableLocation,
} from '../../services/locations';
import { useLocationContext } from '../../contexts/LocationContext';

const { Title, Text } = Typography;

const LocationsManagementPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [form] = Form.useForm();
  const { refreshLocations } = useLocationContext();

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await getLocations(showInactive);
      setLocations(data);
    } catch (error) {
      message.error('Error al cargar las sucursales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [showInactive]);

  const showModal = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      form.setFieldsValue(location);
    } else {
      setEditingLocation(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingLocation(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingLocation) {
        await updateLocation(editingLocation.id, values as UpdateLocationDto);
        message.success('Sucursal actualizada con éxito');
      } else {
        await createLocation(values as CreateLocationDto);
        message.success('Sucursal creada con éxito');
      }
      await fetchLocations();
      await refreshLocations(); // <-- Notifica al contexto para que se actualice
      handleCancel();
    } catch (error) {
      message.error('Ocurrió un error al guardar la sucursal');
    }
  };

  const handleDisable = async (id: string) => {
    try {
      await disableLocation(id);
      message.success('Sucursal deshabilitada con éxito');
      await fetchLocations();
      await refreshLocations(); // <-- Notifica al contexto para que se actualice
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error al deshabilitar la sucursal');
    }
  };

  const handleEnable = async (id: string) => {
    try {
      await enableLocation(id);
      message.success('Sucursal habilitada con éxito');
      await fetchLocations();
      await refreshLocations(); // <-- Notifica al contexto para que se actualice
    } catch (error) {
      message.error('Error al habilitar la sucursal');
    }
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Location, b: Location) => a.name.localeCompare(b.name),
      render: (text: string, record: Location) => (
        <Space>
          {text}
          {record.deletedAt ? <Tag color="red">Inactiva</Tag> : <Tag color="green">Activa</Tag>}
        </Space>
      ),
    },
    { title: 'Dirección', dataIndex: 'address', key: 'address' },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Location) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} disabled={!!record.deletedAt}>
            Editar
          </Button>
          {record.deletedAt ? (
            <Button icon={<CheckCircleOutlined />} onClick={() => handleEnable(record.id)}>
              Habilitar
            </Button>
          ) : (
            <Popconfirm
              title="¿Estás seguro de deshabilitar esta sucursal?"
              description="No se podrá operar en ella hasta que se vuelva a habilitar."
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
          <Title level={2} style={{ margin: 0 }}>Gestión de Sucursales</Title>
        </Col>
        <Col>
          <Space>
            <Text>Mostrar inactivas</Text>
            <Switch checked={showInactive} onChange={setShowInactive} />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
              Crear Sucursal
            </Button>
          </Space>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={locations}
        rowKey="id"
        loading={loading}
        rowClassName={(record) => (record.deletedAt ? 'table-row-disabled' : '')}
      />
      <Modal
        title={editingLocation ? 'Editar Sucursal' : 'Crear Sucursal'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Guardar"
        cancelText="Cancelar"
        destroyOnClose
      >
        <Form form={form} layout="vertical" name="location_form">
          <Form.Item
            name="name"
            label="Nombre de la Sucursal"
            rules={[{ required: true, message: 'Por favor, ingresa el nombre.' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Dirección"
            rules={[{ required: true, message: 'Por favor, ingresa la dirección.' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="latitude" label="Latitud (Opcional)">
            <Input type="number" step="any" />
          </Form.Item>
          <Form.Item name="longitude" label="Longitud (Opcional)">
            <Input type="number" step="any" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default LocationsManagementPage;