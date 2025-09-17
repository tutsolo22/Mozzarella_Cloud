import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Spin,
  Alert,
  Typography,
  Space,
  Popconfirm,
  notification,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getLocations,
} from '../../services/api';
import { User, CreateUserDto, UpdateUserDto } from '../../types/user';
import { Location } from '../../types/location';

// En una aplicación real, estos roles se obtendrían de un endpoint /roles
const mockRoles = [
  { id: 'a4b1c2d3-e4f5-g6h7-i8j9-k0l1m2n3o4p5', name: 'admin' },
  { id: 'b5c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6', name: 'manager' },
  { id: 'c6d3e4f5-g6h7-i8j9-k0l1-m2n3o4p5q6r7', name: 'kitchen' },
  { id: 'd7e4f5g6-h7i8-j9k0-l1m2-n3o4p5q6r7s8', name: 'delivery' },
];

const { Title } = Typography;
const { Option } = Select;

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, locationsData] = await Promise.all([getUsers(), getLocations()]);
      setUsers(usersData);
      setLocations(locationsData);
    } catch (err) {
      setError('No se pudieron cargar los datos de usuarios y sucursales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (user: User | null = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue({
        ...user,
        locationId: user.locationId || null,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleFormSubmit = async (values: any) => {
    const dto = { ...values, locationId: values.locationId || undefined };
    try {
      if (editingUser) {
        await updateUser(editingUser.id, dto as UpdateUserDto);
        notification.success({ message: 'Usuario actualizado correctamente' });
      } else {
        await createUser(dto as CreateUserDto);
        notification.success({ message: 'Usuario creado correctamente' });
      }
      fetchData();
      handleCancel();
    } catch (err: any) {
      notification.error({
        message: 'Error al guardar el usuario',
        description: err.response?.data?.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      notification.success({ message: 'Usuario eliminado correctamente' });
      fetchData();
    } catch (err: any) {
      notification.error({
        message: 'Error al eliminar el usuario',
        description: err.response?.data?.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  const columns = [
    { title: 'Nombre Completo', dataIndex: 'fullName', key: 'fullName', sorter: (a: User, b: User) => a.fullName.localeCompare(b.fullName) },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Rol', dataIndex: ['role', 'name'], key: 'role', render: (roleName: string) => <Tag color="blue">{roleName?.toUpperCase()}</Tag> },
    {
      title: 'Sucursal Asignada',
      dataIndex: ['location', 'name'],
      key: 'location',
      render: (locationName: string) => locationName || <Tag>No asignada</Tag>,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)}>Editar</Button>
          <Popconfirm title="¿Estás seguro de eliminar este usuario?" onConfirm={() => handleDelete(record.id)} okText="Sí" cancelText="No">
            <Button icon={<DeleteOutlined />} danger>Eliminar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) return <Spin tip="Cargando usuarios..." />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}><UserOutlined /> Gestión de Usuarios</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()} style={{ marginBottom: 16 }}>
        Crear Usuario
      </Button>
      <Table columns={columns} dataSource={users} rowKey="id" />

      <Modal
        title={editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item name="fullName" label="Nombre Completo" rules={[{ required: true, message: 'El nombre es requerido.' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Ingresa un email válido.' }]}>
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="Contraseña" rules={[{ required: true, min: 8, message: 'La contraseña debe tener al menos 8 caracteres.' }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="roleId" label="Rol" rules={[{ required: true, message: 'El rol es requerido.' }]}>
            <Select placeholder="Selecciona un rol">
              {mockRoles.map(role => <Option key={role.id} value={role.id}>{role.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="locationId" label="Sucursal Asignada">
            <Select placeholder="Opcional: asigna una sucursal" allowClear>
              {locations.map(loc => <Option key={loc.id} value={loc.id}>{loc.name}</Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;