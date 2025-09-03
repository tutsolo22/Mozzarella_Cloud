import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Typography, Spin, Alert, notification, Tabs, Space, Popconfirm } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, UsergroupAddOutlined } from '@ant-design/icons';
// Asumimos que estas funciones de API serán creadas
import { getEmployees, getPositions, deletePosition, getUsers } from '../../services/api'; 
import { User } from '../../types/user';

const { Title } = Typography;
const { TabPane } = Tabs;

// Tipos para los datos de RRHH (deberían ir en un archivo types/hr.ts)
interface Position {
  id: string;
  name: string;
  description: string;
}
interface Employee {
  id: string;
  user: User;
  position: Position;
  salary: number;
  paymentFrequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  hireDate: string;
}

const HRManagementPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para los modales (los componentes de los modales se crearían por separado)
  const [isEmployeeModalVisible, setIsEmployeeModalVisible] = useState(false);
  const [isPositionModalVisible, setIsPositionModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Employee | Position | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [employeesData, positionsData, usersData] = await Promise.all([
        getEmployees(),
        getPositions(),
        getUsers(), // Necesitamos los usuarios para asignarlos como empleados
      ]);
      setEmployees(employeesData);
      setPositions(positionsData);
      setUsers(usersData);
    } catch (err) {
      setError('No se pudieron cargar los datos de Recursos Humanos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (record: Employee | Position, type: 'employee' | 'position') => {
    setEditingRecord(record);
    if (type === 'employee') setIsEmployeeModalVisible(true);
    else setIsPositionModalVisible(true);
  };

  const handleAdd = (type: 'employee' | 'position') => {
    setEditingRecord(null);
    if (type === 'employee') setIsEmployeeModalVisible(true);
    else setIsPositionModalVisible(true);
  };

  const handleDeletePosition = async (positionId: string) => {
    try {
      await deletePosition(positionId);
      notification.success({ message: 'Puesto eliminado con éxito.' });
      fetchData();
    } catch (err: any) {
      notification.error({ message: 'Error al eliminar', description: err.response?.data?.message || 'No se pudo eliminar el puesto.' });
    }
  };

  const positionColumns = [
    { title: 'Nombre del Puesto', dataIndex: 'name', key: 'name' },
    { title: 'Descripción', dataIndex: 'description', key: 'description' },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Position) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record, 'position')}>Editar</Button>
          <Popconfirm title="¿Seguro que quieres eliminar este puesto?" onConfirm={() => handleDeletePosition(record.id)}>
            <Button icon={<DeleteOutlined />} danger>Eliminar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const employeeColumns = [
    { title: 'Nombre', dataIndex: ['user', 'fullName'], key: 'name' },
    { title: 'Email', dataIndex: ['user', 'email'], key: 'email' },
    { title: 'Puesto', dataIndex: ['position', 'name'], key: 'position' },
    { title: 'Salario', dataIndex: 'salary', key: 'salary', render: (s: number) => `$${Number(s).toFixed(2)}` },
    { title: 'Frecuencia de Pago', dataIndex: 'paymentFrequency', key: 'paymentFrequency' },
    { title: 'Fecha de Contratación', dataIndex: 'hireDate', key: 'hireDate', render: (d: string) => new Date(d).toLocaleDateString() },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Employee) => (
        <Button icon={<EditOutlined />} onClick={() => handleEdit(record, 'employee')}>Editar</Button>
      ),
    },
  ];

  if (loading) return <Spin tip="Cargando..." />;
  if (error) return <Alert message="Error" description={error} type="error" />;

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}><UsergroupAddOutlined /> Gestión de Recursos Humanos</Title>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Empleados" key="1">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd('employee')} style={{ marginBottom: 16 }}>
            Añadir Empleado
          </Button>
          <Table dataSource={employees} columns={employeeColumns} rowKey="id" />
        </TabPane>
        <TabPane tab="Puestos" key="2">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd('position')} style={{ marginBottom: 16 }}>
            Añadir Puesto
          </Button>
          <Table dataSource={positions} columns={positionColumns} rowKey="id" />
        </TabPane>
      </Tabs>

      {/* Aquí irían los modales de edición, por ejemplo: */}
      {/* <EmployeeEditModal visible={isEmployeeModalVisible} record={editingRecord} onClose={() => setIsEmployeeModalVisible(false)} onSuccess={fetchData} users={users} positions={positions} /> */}
      {/* <PositionEditModal visible={isPositionModalVisible} record={editingRecord} onClose={() => setIsPositionModalVisible(false)} onSuccess={fetchData} /> */}
    </div>
  );
};

export default HRManagementPage;