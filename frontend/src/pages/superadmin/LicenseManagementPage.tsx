import React, { useState, useEffect } from 'react';
import { Table, Card, Spin, Alert, Typography, Tag, Button, Modal, notification, Form, InputNumber, Space } from 'antd';
import { getTenants, generateLicense, revokeLicense } from '../../services/api';
import type { ColumnsType } from 'antd/es/table';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons';
import { Tenant } from '../../types/tenant';
import { License, GenerateLicenseDto } from '../../types/license';

const { Title, Paragraph } = Typography;

const LicenseManagementPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [form] = Form.useForm();

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

  const openLicenseModal = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    form.setFieldsValue({
      userLimit: tenant.license?.userLimit || 5,
      branchLimit: tenant.license?.branchLimit || 1,
      durationInDays: 365,
    });
    setIsModalOpen(true);
  };

  const handleLicenseFormSubmit = async (values: GenerateLicenseDto) => {
    if (!selectedTenant) return;

    try {
      const newLicense = await generateLicense(selectedTenant.id, values);
      notification.success({
        message: 'Licencia Generada',
        description: `Se ha generado una nueva licencia para ${selectedTenant.name}.`,
      });
      // Show generated key in a modal
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
      fetchTenants(); // Reload tenants list
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      notification.error({
        message: 'Error al Generar Licencia',
        description: err.response?.data?.message || 'No se pudo generar la licencia. Intente de nuevo.',
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
          fetchTenants(); // Reload list to see updated status
        } catch (err: any) {
          notification.error({
            message: 'Error al Revocar',
            description: err.response?.data?.message || 'No se pudo revocar la licencia. Intente de nuevo.',
          });
        }
      },
    });
  };

  const getLicenseStatusTag = (license: License | null) => {
    if (!license) {
      return <Tag icon={<ExclamationCircleOutlined />} color="#333333">Sin Licencia</Tag>;
    }
    if (license.status === 'revoked') {
        return <Tag icon={<ExclamationCircleOutlined />} color="#ed295aff">Revocada</Tag>;
    }
    const isExpired = new Date(license.expiresAt) < new Date();
    if (isExpired) {
      return <Tag icon={<ClockCircleOutlined />} color="#ed295aff">Expirada</Tag>;
    }
    return (
      <Tag icon={<CheckCircleOutlined />} color="#DAA520">
        Activa
      </Tag>
    );
  };

  const columns: ColumnsType<Tenant> = [
    { title: 'Tenant', dataIndex: 'name', key: 'name' },
    { title: 'Estado Licencia', key: 'licenseStatus', dataIndex: 'license', render: getLicenseStatusTag },
    { title: 'Límite Usuarios', dataIndex: ['license', 'userLimit'], key: 'userLimit', align: 'center', render: (limit) => limit || 'N/A' },
    { title: 'Límite Sucursales', dataIndex: ['license', 'branchLimit'], key: 'branchLimit', align: 'center', render: (limit) => limit || 'N/A' },
    { title: 'Expira el', dataIndex: ['license', 'expiresAt'], key: 'expiresAt', render: (date: string | null) => date ? new Date(date).toLocaleDateString('es-ES') : 'N/A' },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record: Tenant) => (
        <Space>
          <Button icon={<PlusOutlined />} onClick={() => openLicenseModal(record)}>
            {record.license ? 'Actualizar' : 'Generar'} Licencia
          </Button>
          <Button
            icon={<StopOutlined />}
            style={{ color: '#ed295aff', borderColor: '#ed295aff' }}
            onClick={() => handleRevokeLicense(record)}
            disabled={!record.license || record.license.status !== 'active'}
          >
            Revocar
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) return <Spin tip="Cargando tenants..." size="large" style={{ display: 'block', marginTop: 50 }} />;
  if (error) return <Alert message={error} type="error" showIcon />;

  return (
    <>
      <Card>
        <Title level={2}>Gestión de Licencias</Title>
        <Paragraph>
          Desde este panel puedes generar, actualizar y revocar las licencias para cada tenant.
          Al generar una nueva licencia para un tenant que ya tiene una, la anterior será revocada automáticamente.
        </Paragraph>
        <Table columns={columns} dataSource={tenants} rowKey="id" />
      </Card>

      <Modal title={`Gestionar Licencia para ${selectedTenant?.name}`} open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleLicenseFormSubmit}>
          <Form.Item name="userLimit" label="Límite de Usuarios" rules={[{ required: true, message: 'Campo obligatorio' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="branchLimit" label="Límite de Sucursales" rules={[{ required: true, message: 'Campo obligatorio' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="durationInDays" label="Duración (días)" rules={[{ required: true, message: 'Campo obligatorio' }]}>
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

export default LicenseManagementPage;