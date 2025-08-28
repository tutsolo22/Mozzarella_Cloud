import React, { useState, useEffect } from 'react';
import { Table, Card, Spin, Alert, Typography, Tag, Button, Modal, notification, Form, InputNumber, Space } from 'antd';
import { getTenants, updateTenantStatus, generateLicense, revokeLicense } from '../../services/api';
import type { ColumnsType } from 'antd/es/table';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

type TenantStatus = 'active' | 'suspended' | 'trial';

interface License {
  id: string;
  key: string;
  status: 'active' | 'expired' | 'revoked';
  expiresAt: string;
}

interface Tenant {
  id: string;
  name: string;
  status: TenantStatus;
  createdAt: string;
  license: License | null;
}

const TenantListPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [form] = Form.useForm();

  const handleUpdateStatus = async (tenantId: string, newStatus: TenantStatus) => {
    const actionText = newStatus === 'active' ? 'reactivar' : 'suspender';
    const title = `¿Seguro que quieres ${actionText} este tenant?`;

    Modal.confirm({
      title,
      content: newStatus === 'suspended' ? 'Los usuarios de este tenant no podrán iniciar sesión.' : 'Los usuarios de este tenant recuperarán el acceso.',
      okText: `Sí, ${actionText}`,
      okType: newStatus === 'suspended' ? 'danger' : 'primary',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await updateTenantStatus(tenantId, newStatus);
          setTenants(currentTenants =>
            currentTenants.map(tenant =>
              tenant.id === tenantId ? { ...tenant, status: newStatus } : tenant
            )
          );
          notification.success({
            message: 'Estado Actualizado',
            description: `El tenant ha sido ${newStatus === 'active' ? 'reactivado' : 'suspendido'} con éxito.`,
          });
        } catch (err) {
          notification.error({
            message: 'Error al Actualizar',
            description: 'No se pudo cambiar el estado del tenant. Intente de nuevo.',
          });
        }
      },
    });
  };

  const openLicenseModal = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  const handleLicenseFormSubmit = async (values: any) => {
    if (!selectedTenant) return;

    try {
      const newLicense = await generateLicense(selectedTenant.id, values);
      notification.success({
        message: 'Licencia Generada',
        description: `Se ha generado una nueva licencia para ${selectedTenant.name}.`,
      });
      // Mostrar la clave generada en un modal
      Modal.success({
        title: 'Clave de Licencia Generada',
        content: (
          <div>
            <Paragraph>Guarde esta clave en un lugar seguro. No se podrá mostrar de nuevo.</Paragraph>
            <Paragraph copyable={{ tooltips: ['Copiar clave', '¡Copiada!'] }}>
              <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>{newLicense.key}</pre>
            </Paragraph>
          </div>
        ),
      });
      fetchTenants(); // Recargar la lista de tenants
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      notification.error({
        message: 'Error al Generar Licencia',
        description: 'No se pudo generar la licencia. Intente de nuevo.',
      });
    }
  };

  const handleRevokeLicense = (tenant: Tenant) => {
    if (!tenant.license) return;

    Modal.confirm({
      title: `¿Seguro que quieres revocar la licencia de ${tenant.name}?`,
      content: 'Esta acción es irreversible. La instalación local del cliente dejará de funcionar hasta que se genere una nueva licencia.',
      okText: 'Sí, revocar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await revokeLicense(tenant.id);
          notification.success({
            message: 'Licencia Revocada',
            description: `La licencia de ${tenant.name} ha sido revocada con éxito.`,
          });
          fetchTenants(); // Recargar la lista para ver el estado actualizado
        } catch (err) {
          notification.error({
            message: 'Error al Revocar',
            description: 'No se pudo revocar la licencia. Intente de nuevo.',
          });
        }
      },
    });
  };

  const columns: ColumnsType<Tenant> = [
    {
      title: 'Nombre del Restaurante',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: TenantStatus) => {
        let color = status === 'active' ? 'green' : 'volcano';
        if (status === 'trial') {
          color = 'blue';
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Fecha de Registro',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('es-ES'),
    },
    {
      title: 'Licencia',
      key: 'license',
      dataIndex: 'license',
      render: (license: License | null) => {
        if (!license) {
          return <Tag icon={<ExclamationCircleOutlined />} color="default">Sin Licencia</Tag>;
        }
        const isExpired = new Date(license.expiresAt) < new Date();
        if (isExpired || license.status !== 'active') {
          return <Tag icon={<ClockCircleOutlined />} color="error">Expirada/Inválida</Tag>;
        }
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Activa hasta {new Date(license.expiresAt).toLocaleDateString('es-ES')}
          </Tag>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record: Tenant) => (
        <Space>
          <Button
            type="primary"
            danger={record.status === 'active'}
            onClick={() => handleUpdateStatus(record.id, record.status === 'active' ? 'suspended' : 'active')}
          >
            {record.status === 'active' ? 'Suspender' : 'Reactivar'}
          </Button>
          <Button icon={<PlusOutlined />} onClick={() => openLicenseModal(record)}>
            Licencia
          </Button>
          <Button
            danger
            onClick={() => handleRevokeLicense(record)}
            disabled={!record.license || record.license.status !== 'active' || new Date(record.license.expiresAt) < new Date()}
          >
            Revocar
          </Button>
        </Space>
      ),
    },
  ];
  
  const fetchTenants = async () => {
    try {
      setLoading(true);
      const data = await getTenants();
      setTenants(data);
    } catch (err) {
      setError('No se pudieron cargar los tenants. Asegúrese de tener permisos de Super Administrador.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  if (loading) return <Spin tip="Cargando tenants..." size="large" style={{ display: 'block', marginTop: 50 }} />;
  if (error) return <Alert message={error} type="error" showIcon />;

  return (
    <>
      <Card>
        <Title level={2}>Gestión de Tenants</Title>
        <Table columns={columns} dataSource={tenants} rowKey="id" />
      </Card>

      <Modal
        title={`Generar Licencia para ${selectedTenant?.name}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleLicenseFormSubmit}
          initialValues={{ userLimit: 5, branchLimit: 1, durationInDays: 365 }}
        >
          <Form.Item name="userLimit" label="Límite de Usuarios" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="branchLimit" label="Límite de Sucursales" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="durationInDays" label="Duración (días)" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Generar Clave de Licencia
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TenantListPage;