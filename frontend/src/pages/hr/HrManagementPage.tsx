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
  Row,
  Col,
  Select,
  InputNumber,
  DatePicker,
  Checkbox,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UsergroupAddOutlined, IdcardOutlined, MailOutlined } from '@ant-design/icons';
import {
  getPositions,
  createPosition,
  updatePosition,
  deletePosition,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getRoles,
  resendInvitation,
} from '../../services/api';
import { Position, Employee, CreatePositionDto, UpdatePositionDto, CreateEmployeeDto, UpdateEmployeeDto, PaymentFrequency } from '../../types/hr';
import { Role } from '../../types/role';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;
const { Option } = Select;

// --- Position Management Component ---
const PositionManagement: React.FC<{ onPositionsChange: () => void }> = ({ onPositionsChange }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [form] = Form.useForm();

  const fetchPositions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPositions();
      setPositions(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudieron cargar los puestos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const handleOpenModal = (position: Position | null) => {
    setEditingPosition(position);
    form.setFieldsValue(position ? { name: position.name, description: position.description } : { name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingPosition(null);
    form.resetFields();
  };

  const handleFormSubmit = async (values: CreatePositionDto) => {
    try {
      if (editingPosition) {
        await updatePosition(editingPosition.id, values as UpdatePositionDto);
        notification.success({ message: 'Puesto actualizado con éxito' });
      } else {
        await createPosition(values);
        notification.success({ message: 'Puesto creado con éxito' });
      }
      fetchPositions();
      onPositionsChange(); // Notify parent to refetch
      handleCancel();
    } catch (err: any) {
      notification.error({
        message: 'Error',
        description: err.response?.data?.message || 'Ocurrió un error al guardar el puesto.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePosition(id);
      notification.success({ message: 'Puesto eliminado con éxito' });
      fetchPositions();
      onPositionsChange(); // Notify parent to refetch
    } catch (err: any) {
      notification.error({
        message: 'Error al eliminar',
        description: err.response?.data?.message || 'No se pudo eliminar el puesto.',
      });
    }
  };

  const columns: ColumnsType<Position> = [
    { title: 'Nombre del Puesto', dataIndex: 'name', key: 'name' },
    { title: 'Descripción', dataIndex: 'description', key: 'description' },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm
            title="¿Eliminar el puesto?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Title level={4} style={{ margin: 0 }}>
          <IdcardOutlined style={{ marginRight: 8 }} />
          Puestos de Trabajo
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
          Crear Puesto
        </Button>
      </div>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />}
      <Table columns={columns} dataSource={positions} rowKey="id" loading={loading} />
      <Modal
        title={editingPosition ? 'Editar Puesto' : 'Crear Nuevo Puesto'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'El nombre es obligatorio' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descripción">
            <Input.TextArea rows={3} />
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
    </Card>
  );
};

// --- Employee Management Component ---
const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [createWithUser, setCreateWithUser] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [employeesData, positionsData, rolesData] = await Promise.all([
        getEmployees(),
        getPositions(),
        getRoles(), // Fetch roles for the user creation form
      ]);
      setEmployees(employeesData);
      setPositions(positionsData);
      setRoles(rolesData.filter(r => r.name !== 'super_admin')); // Exclude super_admin role
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudieron cargar los datos de empleados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (employee: Employee | null) => {
    setEditingEmployee(employee);
    if (employee) {
      form.setFieldsValue({
        fullName: employee.fullName,
        positionId: employee.position.id,
        salary: employee.salary,
        paymentFrequency: employee.paymentFrequency,
        hireDate: dayjs(employee.hireDate),
      });
      setCreateWithUser(false); // Can't add a user account when editing
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setCreateWithUser(false);
    form.resetFields();
  };

  const handleFormSubmit = async (values: any) => {
    const dto: CreateEmployeeDto | UpdateEmployeeDto = {
      ...values,
      createSystemUser: createWithUser,
      hireDate: dayjs(values.hireDate).format('YYYY-MM-DD'),
    };

    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, dto as UpdateEmployeeDto);
        notification.success({ message: 'Empleado actualizado con éxito' });
      } else {
        await createEmployee(dto as CreateEmployeeDto);
        notification.success({ message: 'Empleado creado con éxito' });
      }
      fetchData();
      handleCancel();
    } catch (err: any) {
      notification.error({
        message: 'Error',
        description: err.response?.data?.message || 'Ocurrió un error al guardar el empleado.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEmployee(id);
      notification.success({ message: 'Empleado eliminado con éxito' });
      fetchData();
    } catch (err: any) {
      notification.error({
        message: 'Error al eliminar',
        description: err.response?.data?.message || 'No se pudo eliminar el registro del empleado.',
      });
    }
  };

  const handleResendInvitation = async (userId: string) => {
    try {
      await resendInvitation(userId);
      notification.success({ message: 'Invitación reenviada con éxito' });
    } catch (err: any) {
      notification.error({
        message: 'Error al reenviar',
        description: err.response?.data?.message || 'No se pudo reenviar la invitación.',
      });
    }
  };

  const columns: ColumnsType<Employee> = [
    { title: 'Nombre', dataIndex: 'fullName', key: 'name' },
    { title: 'Email (Usuario)', dataIndex: ['user', 'email'], key: 'email', render: (email) => email || <Tag>Sin acceso</Tag> },
    { title: 'Puesto', dataIndex: ['position', 'name'], key: 'position' },
    { title: 'Salario', dataIndex: 'salary', key: 'salary', render: (val) => `$${Number(val).toFixed(2)}` },
    {
      title: 'Frecuencia de Pago',
      dataIndex: 'paymentFrequency',
      key: 'paymentFrequency',
      render: (freq: string) => {
        return freq.charAt(0).toUpperCase() + freq.slice(1).replace('-',' ');
      }
    },
    { title: 'Fecha de Contratación', dataIndex: 'hireDate', key: 'hireDate', render: (val) => dayjs(val).format('DD/MM/YYYY') },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          {record.user && record.user.status === 'pending_verification' && (
            <Popconfirm
              title="¿Reenviar invitación?"
              onConfirm={() => handleResendInvitation(record.userId!)}
              okText="Sí" cancelText="No"
            ><Button icon={<MailOutlined />} title="Reenviar invitación" /></Popconfirm>
          )}
          <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm
            title="¿Eliminar este empleado?"
            description="Esta acción eliminará el registro de empleado, pero no la cuenta de usuario."
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Title level={4} style={{ margin: 0 }}>
          <UsergroupAddOutlined style={{ marginRight: 8 }} />
          Empleados
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
          Añadir Empleado
        </Button>
      </div>
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />}
      <Table columns={columns} dataSource={employees} rowKey="id" loading={loading} />
      <Modal
        title={editingEmployee ? 'Editar Empleado' : 'Añadir Nuevo Empleado'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item name="fullName" label="Nombre Completo" rules={[{ required: true, message: 'El nombre es obligatorio' }]}>
            <Input placeholder="Ej: Juan Pérez" disabled={!!editingEmployee} />
          </Form.Item>

          {!editingEmployee && (
            <Form.Item name="createSystemUser" valuePropName="checked">
              <Checkbox onChange={(e) => setCreateWithUser(e.target.checked)}>
                Crear acceso al sistema para este empleado
              </Checkbox>
            </Form.Item>
          )}

          {createWithUser && !editingEmployee && (
            <>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Ingresa un email válido' }]}>
                <Input placeholder="ejemplo@correo.com" />
              </Form.Item>
              <Form.Item name="roleId" label="Rol del Sistema" rules={[{ required: true, message: 'Selecciona un rol' }]}>
                <Select placeholder="Seleccionar rol">{roles.map(role => <Option key={role.id} value={role.id}>{role.name}</Option>)}</Select>
              </Form.Item>
            </>
          )}

          <Form.Item name="positionId" label="Puesto" rules={[{ required: true, message: 'Selecciona un puesto' }]}>
            <Select placeholder="Seleccionar puesto">
              {positions.map(pos => (
                <Option key={pos.id} value={pos.id}>{pos.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="salary" label="Salario" rules={[{ required: true, message: 'Ingresa el salario' }]}>
                <InputNumber style={{ width: '100%' }} prefix="$" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="paymentFrequency" label="Frecuencia de Pago" rules={[{ required: true, message: 'Selecciona la frecuencia' }]}>
                <Select>
                  {Object.values(PaymentFrequency).map(freq => (
                    <Option key={freq} value={freq}>{freq.charAt(0).toUpperCase() + freq.slice(1)}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="hireDate" label="Fecha de Contratación" rules={[{ required: true, message: 'Selecciona la fecha' }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
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
    </Card>
  );
};

// --- Main Page Component ---
const HrManagementPage: React.FC = () => {
  const [key, setKey] = useState(0); // Key to force re-render of EmployeeManagement

  const handlePositionsChange = () => {
    setKey(prevKey => prevKey + 1);
  };

  return (
    <>
      <Title level={2}>Recursos Humanos</Title>
      <Paragraph>Gestiona los puestos de trabajo y los perfiles de los empleados de tu negocio.</Paragraph>
      <PositionManagement onPositionsChange={handlePositionsChange} />
      <EmployeeManagement key={key} />
    </>
  );
};

export default HrManagementPage;