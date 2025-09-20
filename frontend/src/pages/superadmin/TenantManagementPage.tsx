import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Tag, Tooltip, Space, Popconfirm } from 'antd';
import { PlusOutlined, MailOutlined, EditOutlined, StopOutlined, CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { getTenants, createTenant, resendInvitation, updateTenant, updateTenantStatus, deleteTenant } from '../../services/api';
import { Tenant, TenantStatus } from '../../types/tenant';
import { User, UserStatus } from '../../types/user';

const TenantManagementPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const data = await getTenants();
      setTenants(data);
    } catch (error) {
      message.error('Error al cargar los tenants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditingTenant(null);
    editForm.resetFields();
  };


  const handleCreate = async (values: any) => {
    setIsSubmitting(true);
    try {
      await createTenant(values);
      message.success('Tenant creado con éxito. Se ha enviado un correo de invitación al administrador.');
      setIsModalVisible(false);
      fetchTenants();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al crear el tenant.';
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (values: { name: string }) => {
    if (!editingTenant) return;
    try {
      setLoading(true);
      await updateTenant(editingTenant.id, values);
      message.success('Tenant actualizado con éxito.');
      setIsEditModalVisible(false);
      fetchTenants(); // Refetch all tenants
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar el tenant.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const handleResendInvitation = async (userId: string | undefined) => {
    if (!userId) {
      message.error('No se pudo encontrar el ID del usuario administrador.');
      return;
    }
    try {
      await resendInvitation(userId);
      message.success('Invitación reenviada con éxito.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al reenviar la invitación.';
      message.error(errorMessage);
    }
  };

  const handleUpdateStatus = async (tenantId: string, newStatus: TenantStatus) => {
    const actionText = newStatus === TenantStatus.Suspended ? 'suspender' : 'reactivar';
    try {
      const updatedTenant = await updateTenantStatus(tenantId, newStatus);
      setTenants(prevTenants =>
        prevTenants.map(t => t.id === tenantId ? { ...t, status: updatedTenant.status } : t)
      );
      message.success(`Tenant ${actionText === 'suspender' ? 'suspendido' : 'reactivado'} con éxito.`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Error al ${actionText} el tenant.`;
      message.error(errorMessage);
    }
  };

  const handleDelete = async (tenantId: string) => {
    try {
      setLoading(true);
      await deleteTenant(tenantId);
      message.success('Tenant eliminado permanentemente.');
      fetchTenants();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar el tenant.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const showEditModal = (tenant: Tenant) => {
    setEditingTenant(tenant);
    editForm.setFieldsValue({ name: tenant.name });
    setIsEditModalVisible(true);
  };

  const getStatusTag = (status: TenantStatus) => {
    const statusConfig: Record<TenantStatus, { color: string; text: string }> = {
      [TenantStatus.Active]: { color: 'success', text: 'Activo' },
      [TenantStatus.Trial]: { color: 'processing', text: 'De Prueba' },
      [TenantStatus.Suspended]: { color: 'error', text: 'Suspendido' },
      [TenantStatus.Inactive]: { color: 'default', text: 'Inactivo' },
    };
    const config = statusConfig[status];
    if (config) {
      return <Tag color={config.color}>{config.text}</Tag>;
    }
    return <Tag>{status}</Tag>;
  };

  const columns = [
    {
      title: 'Nombre del Tenant',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
    },
    {
      title: 'Administrador',
      key: 'admin',
      render: (_: any, record: Tenant): React.ReactNode => {
        const admin = record.users?.find(u => u.role.name === 'admin');
        if (!admin) return 'N/A';
        return `${admin.fullName} (${admin.email})`;
      },
    },
    {
      title: 'Licencia',
      key: 'license',
      render: (_: any, record: Tenant): React.ReactNode => {
        if (!record.license) return <Tag color="#800020">Sin Licencia</Tag>;
        const expires = new Date(record.license.expiresAt);
        const isExpired = expires < new Date();
        return (
          <Tooltip title={`Expira el ${expires.toLocaleDateString()}`}>
            <Tag color={isExpired ? '#800020' : '#DAA520'}>
              {isExpired ? 'Expirada' : 'Vigente'}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Tenant): React.ReactNode => {
        const admin = record.users?.find(u => u.role.name === 'admin');
        const isSuspended = record.status === TenantStatus.Suspended;
        return (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
              Editar
            </Button>
            <Popconfirm
              title={`¿Seguro que quieres ${isSuspended ? 'reactivar' : 'suspender'} este tenant?`}
              onConfirm={() => handleUpdateStatus(record.id, isSuspended ? TenantStatus.Active : TenantStatus.Suspended)}
              okText="Sí"
              cancelText="No"
            >
              <Button
                type={isSuspended ? "primary" : "default"}
                style={
                  isSuspended
                    ? { background: '#8B8000', borderColor: '#8B8000' }
                    : { color: '#ffffffff', borderColor: '#ed295aff' }
                }
                icon={
                  isSuspended ? <CheckCircleOutlined /> : <StopOutlined style={{ color: '#ed295aff' }} />
                }
              >
                {isSuspended ? 'Reactivar' : 'Suspender'}
              </Button>
            </Popconfirm>
            {admin && admin.status === UserStatus.PendingVerification && (
              <Tooltip title="Reenviar correo de configuración de cuenta">
                <Button
                  icon={<MailOutlined />}
                  onClick={() => handleResendInvitation(admin?.id)}
                />
              </Tooltip>
            )}
            <Popconfirm
              title="¿ELIMINAR PERMANENTEMENTE?"
              description="Esta acción es irreversible y borrará todos los datos del tenant."
              onConfirm={() => handleDelete(record.id)}
              okText="Sí, eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
            >
              <Button
                style={{ color: '#ffffffff', borderColor: '#ed295aff' }}
                icon={<DeleteOutlined style={{ color: '#ed295aff' }} />}
              >
                Borrar
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={showModal}
        style={{ marginBottom: 16 }}
      >
        Añadir Tenant
      </Button>
      <Table
        columns={columns}
        dataSource={tenants}
        loading={loading}
        rowKey="id"
      />
      <Modal
        title="Crear Nuevo Tenant"
        open={isModalVisible}
        onOk={form.submit}
        onCancel={handleCancel}
        okText="Crear"
        cancelText="Cancelar"
        confirmLoading={isSubmitting}
        destroyOnClose // Resets the form when the modal is closed
      >
        <Form form={form} onFinish={handleCreate} layout="vertical" name="create_tenant_form">
          <Form.Item
            name="name"
            label="Nombre del Tenant"
            rules={[{ required: true, message: 'Por favor, introduce el nombre del tenant.' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="adminFullName"
            label="Nombre Completo del Administrador"
            rules={[{ required: true, message: 'Por favor, introduce el nombre del administrador.' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="adminEmail"
            label="Email del Administrador"
            rules={[{ required: true, type: 'email', message: 'Por favor, introduce un email válido.' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Editar Tenant"
        open={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={[<Button key="back" onClick={handleEditCancel}>Cancelar</Button>, <Button key="submit" type="primary" loading={loading} onClick={() => editForm.submit()}>Guardar Cambios</Button>]}
        confirmLoading={loading}
      >
        <Form form={editForm} onFinish={handleUpdate} layout="vertical">
          <Form.Item
            name="name"
            label="Nombre del Tenant"
            rules={[{ required: true, message: 'Por favor, introduce el nombre del tenant.' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TenantManagementPage;