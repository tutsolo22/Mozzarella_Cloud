import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Spin,
  message,
  Row,
  Col,
  Button,
  Input,
  Popconfirm,
  Tooltip,
  Form,
  Checkbox,
} from 'antd';
import { Tenant, TenantConfiguration, PaymentMethod } from '../../types/tenant';
import {
  getTenantSettings,
  regenerateWhatsappApiKey,
  updateTenantConfiguration,
} from '../../services/tenant';
import DeliveryZoneMap from '../../components/Settings/DeliveryZoneMap';
import KdsSettings from '../../components/Settings/KdsSettings';
import { CopyOutlined, ReloadOutlined, WhatsAppOutlined, CreditCardOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const TenantSettingsPage: React.FC = () => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [form] = Form.useForm();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const settings = await getTenantSettings();
      setTenant(settings);
      setApiKey(settings.whatsappApiKey);
      form.setFieldsValue(settings.configuration);
    } catch (error) {
      message.error('Error al cargar la configuración.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [form]);

  const handleRegenerateKey = async () => {
    setSaving(true);
    try {
      const newKey = await regenerateWhatsappApiKey();
      setApiKey(newKey);
      message.success('Nueva clave de API de WhatsApp generada con éxito.');
    } catch (error) {
      message.error('No se pudo generar la clave de API.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      message.success('Clave de API copiada al portapapeles.');
    }
  };

  const onFinish = async (values: Partial<TenantConfiguration>) => {
    setSaving(true);
    try {
      await updateTenantConfiguration(values);
      message.success('Configuración guardada con éxito.');
      fetchSettings(); // Recargar para asegurar consistencia
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }} />;
  }

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} initialValues={tenant?.configuration}>
      <Title level={2}>Configuración del Negocio</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Área de Entrega"><DeliveryZoneMap /></Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Sonido del KDS"><KdsSettings /></Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<><WhatsAppOutlined /> Integración con WhatsApp</>}>
            <Paragraph>Usa esta clave en la cabecera <Text code>X-API-Key</Text> para conectar tu chatbot.</Paragraph>
            <Input.Group compact>
              <Input style={{ width: 'calc(100% - 120px)' }} value={apiKey || 'No generada'} readOnly />
              <Tooltip title="Copiar"><Button icon={<CopyOutlined />} onClick={handleCopy} disabled={!apiKey} /></Tooltip>
              <Popconfirm title="¿Regenerar clave?" description="La clave actual dejará de funcionar." onConfirm={handleRegenerateKey} okText="Sí" cancelText="No">
                <Button icon={<ReloadOutlined />} loading={saving}>{apiKey ? 'Regenerar' : 'Generar'}</Button>
              </Popconfirm>
            </Input.Group>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<><CreditCardOutlined /> Configuración de Pagos</>}>
            <Form.Item name="enabledPaymentMethods" label="Métodos de Pago Habilitados">
              <Checkbox.Group options={Object.values(PaymentMethod).map(pm => ({ label: pm.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), value: pm }))} />
            </Form.Item>
            <Form.Item name="mercadoPagoAccessToken" label="Access Token de Mercado Pago" tooltip="Encuentra esto en tu panel de desarrollador de Mercado Pago.">
              <Input.Password placeholder="Pega tu Access Token de Producción aquí" />
            </Form.Item>
          </Card>
        </Col>
      </Row>
      <Button type="primary" htmlType="submit" loading={saving} style={{ marginTop: 24 }}>
        Guardar Configuración
      </Button>
    </Form>
  );
};

export default TenantSettingsPage;