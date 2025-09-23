import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  notification,
  Popconfirm,
  Space,
  Card,
  Row,
  Col,
  Typography,
  Switch,
  Tag,
  Spin,
  Alert,
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
  createLocation,
  updateLocation,
  disableLocation,
  enableLocation,
  getLocations,
  getTenantConfiguration,
} from '../../services/api';
import { TenantConfiguration } from '../../types/tenant';
import { useLocationContext } from '../../contexts/LocationContext';

const { Title, Paragraph } = Typography;
const LocationsManagementPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [config, setConfig] = useState<TenantConfiguration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [form] = Form.useForm();
  const { refreshLocations } = useLocationContext();

    const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [locationsData, configData] = await Promise.all([
        getLocations(showInactive),
        getTenantConfiguration(),
      ]);
      setLocations(locationsData);
      setConfig(configData);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
}, [showInactive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showModal = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      form.setFieldsValue(location);
    } else {
      setEditingLocation(null);
      form.resetFields();
      form.setFieldsValue({ isActive: true });
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
      // Limpieza de datos para campos opcionales
      const dto = { ...values };
      if (!dto.phone) dto.phone = null;
      if (!dto.whatsappNumber) dto.whatsappNumber = null;

      if (editingLocation) {
        await updateLocation(editingLocation.id, dto as UpdateLocationDto);
        notification.success({ message: 'Sucursal actualizada con éxito' });
      } else {
        await createLocation(dto as CreateLocationDto);
        notification.success({ message: 'Sucursal creada con éxito' });
      }
      await fetchData();
      await refreshLocations(); // <-- Notifica al contexto para que se actualice
      handleCancel();
    } catch (err: any) {
      notification.error({ message: 'Error al guardar', description: err.response?.data?.message || 'Ocurrió un error' });
    }
  };

  const handleDisable = async (id: string) => {
    try {
      await disableLocation(id);
      notification.success({ message: 'Sucursal deshabilitada con éxito' });
      await fetchData();
      await refreshLocations(); // <-- Notifica al contexto para que se actualice
    } catch (error: any) {
      notification.error({ message: 'Error', description: error.response?.data?.message || 'Error al deshabilitar la sucursal' });
    }
  };

  const handleEnable = async (id: string) => {
    try {
      await enableLocation(id);
      notification.success({ message: 'Sucursal habilitada con éxito' });
      await fetchData();
      await refreshLocations(); // <-- Notifica al contexto para que se actualice
    } catch (error: any) {
      notification.error({ message: 'Error', description: error.response?.data?.message || 'Error al habilitar la sucursal' });
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
          {record.isActive ? <Tag color="green">Activa</Tag> : <Tag color="red">Inactiva</Tag>}
        </Space>
      ),
    },
    { title: 'Dirección', dataIndex: 'address', key: 'address' },
    { title: 'Teléfono', dataIndex: 'phone', key: 'phone', render: (text: string) => text || 'N/A' },
    { title: 'WhatsApp', dataIndex: 'whatsappNumber', key: 'whatsappNumber', render: (text: string) => text || 'N/A' },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Location) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} disabled={!record.isActive}>
            Editar
          </Button>
          {!record.isActive ? (
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

  if (loading) return <Spin tip="Cargando sucursales..." size="large" style={{ display: 'block', marginTop: 50 }} />;

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Gestión de Sucursales</Title>
          <Paragraph>Administra las ubicaciones de tu negocio.</Paragraph>
        </Col>
        <Col>
          <Space>
            <Switch checked={showInactive} onChange={setShowInactive} checkedChildren="Mostrar inactivas" unCheckedChildren="Ocultar inactivas" />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
              Crear Sucursal
            </Button>
          </Space>
        </Col>
      </Row>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />}
      <Table
        columns={columns}
        dataSource={locations}
        rowKey="id"
        loading={loading}
        
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
           <Input.TextArea rows={3} />
          </Form.Item>
          {config?.branchesHaveSeparatePhones && (
            <Form.Item name="phone" label="Teléfono de la Sucursal" rules={[{ pattern: /^\d{10}$/, message: 'El teléfono debe tener 10 dígitos.' }]}>
              <Input type="tel" placeholder="10 dígitos sin espacios" />
            </Form.Item>
          )}
          {config?.branchesHaveSeparateWhatsapps && (
            <Form.Item name="whatsappNumber" label="WhatsApp de la Sucursal">
              <Input placeholder="Ej: 521XXXXXXXXXX" />
            </Form.Item>
          )}
          {!editingLocation && (
            <Form.Item name="isActive" label="Sucursal Activa" valuePropName="checked" initialValue={true}>
              <Switch disabled />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Card>
  );
};

export default LocationsManagementPage;