import React, { useState, useEffect } from 'react';
import {
  Alert,
  Form,
  Input,
  Button,
  Card,
  Typography,
  notification,
  Spin,
  Row,
  Col,
  Collapse,
  Checkbox,
  message,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  SaveOutlined,
  WhatsAppOutlined,
  CreditCardOutlined,
  CopyOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  getTenantConfiguration,
  updateTenantConfiguration,
  regenerateWhatsappApiKey,
} from '../../services/api'; // Corregido para usar el servicio principal de API
import { TenantConfiguration, PaymentMethod } from '../../types/tenant';
import DeliveryZoneMap from '../../components/Settings/DeliveryZoneMap';
const { Title, Paragraph, Text } = Typography;

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Usamos la función que trae toda la configuración, incluyendo la del tenant
        const config = await getTenantConfiguration(); // Esta función viene de api.ts
        // La configuración del formulario viene de la propiedad 'configuration'
        form.setFieldsValue(config);
        setApiKey(config.whatsappApiKey);

      } catch (error) {
        notification.error({
          message: 'Error al cargar la configuración',
          description: 'No se pudo obtener la configuración actual del negocio.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [form]);

  const handleSave = async (values: Partial<TenantConfiguration>) => {
    setSaving(true);

    try {
      await updateTenantConfiguration(values);
      notification.success({
        message: 'Configuración guardada',
        description: 'La información de tu negocio ha sido actualizada con éxito.',
      });
    } catch (error: any) {
      notification.error({
        message: 'Error al guardar',
        description: error.response?.data?.message || 'Ocurrió un error inesperado.',
      });
    } finally {
      setSaving(false);
    }
  };

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
  
  if (loading) {
   return <Spin tip="Cargando configuración..." size="large" style={{ display: 'block', marginTop: 50 }} />; 
  }

  return (
    <div>
      <Title level={2}>Configuración del Negocio</Title>
      <Paragraph>
        Aquí puedes editar la información general, fiscal, de contacto, zonas de entrega y otras configuraciones de tu negocio.
      </Paragraph>
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Alert 
          message="Recuerda guardar tus cambios"
          description="Después de hacer cualquier modificación, no olvides presionar el botón 'Guardar Configuración' al final de la página."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        <Collapse defaultActiveKey={['general', 'delivery', 'integrations']} ghost>
          <Collapse.Panel header="Información General" key="general">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="businessName" label="Nombre Comercial" rules={[{ required: true, message: 'El nombre comercial es obligatorio.' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="legalName" label="Razón Social (Opcional)">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Collapse.Panel>

          <Collapse.Panel header="Información Fiscal" key="fiscal">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="rfc"
                  label="RFC"
                  rules={[{ max: 13, message: 'El RFC no debe exceder los 13 caracteres.' }]}
                  normalize={(value) => (value || '').toUpperCase()}
                >
                  <Input placeholder="Ej: XAXX010101000" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="taxRegime" label="Régimen Fiscal">
                  <Input placeholder="Ej: 612 - Personas Físicas con Actividades Empresariales" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="taxAddress" label="Dirección Fiscal">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Collapse.Panel>

          <Collapse.Panel header="Información de Contacto" key="contact">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="contactEmail" label="Email de Contacto Principal" rules={[{ required: true, type: 'email' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="contactPhone"
                  label="Teléfono de Contacto Principal"
                  rules={[{ pattern: /^\d{10}$/, message: 'El teléfono debe tener 10 dígitos.' }]}
                >
                  <Input type="tel" placeholder="10 dígitos sin espacios" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="businessPhone"
                  label="Teléfono del Negocio (para clientes)"
                  rules={[{ pattern: /^\d{10}$/, message: 'El teléfono debe tener 10 dígitos.' }]}
                >
                  <Input type="tel" placeholder="10 dígitos sin espacios" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="businessWhatsapp" label="Número de WhatsApp del Negocio">
                  <Input placeholder="Ej: 521XXXXXXXXXX" />
                </Form.Item>
              </Col>
            </Row>
          </Collapse.Panel>

          <Collapse.Panel header="Configuración Multi-Sucursal" key="multi-branch">
            <Paragraph>
              Activa estas opciones si quieres gestionar números de contacto diferentes para cada una de tus sucursales.
              Si se dejan desactivadas, todas las sucursales usarán los números de contacto principales del negocio.
            </Paragraph>
            <Form.Item name="branchesHaveSeparatePhones" valuePropName="checked">
              <Checkbox>Cada sucursal maneja un número de teléfono propio</Checkbox>
            </Form.Item>
            <Form.Item name="branchesHaveSeparateWhatsapps" valuePropName="checked">
              <Checkbox>Cada sucursal maneja un número de WhatsApp propio</Checkbox>
            </Form.Item>
          </Collapse.Panel>

          <Collapse.Panel header="Zonas y KDS" key="delivery">
            <Row gutter={[24, 24]}>
              <Col xs={24}>
                <Form.Item name="deliveryArea" label="Área de Entrega">
                  <DeliveryZoneMap />
                </Form.Item>
              </Col>
            </Row>
          </Collapse.Panel>

          <Collapse.Panel header="Integraciones y API Keys" key="integrations">
            <Paragraph>
              Configura aquí las conexiones con servicios externos como WhatsApp, procesadores de pago y facturación electrónica.
            </Paragraph>
            <Card size="small" title={<><WhatsAppOutlined /> Integración con WhatsApp</>} style={{ marginBottom: 16 }}>
              <Paragraph>Usa esta clave en la cabecera <Text code>X-API-Key</Text> para conectar tu chatbot.</Paragraph>
              <Input.Group compact>
                <Input style={{ width: 'calc(100% - 120px)' }} value={apiKey || 'No generada'} readOnly />
                <Tooltip title="Copiar"><Button icon={<CopyOutlined />} onClick={handleCopy} disabled={!apiKey} /></Tooltip>
                <Popconfirm title="¿Regenerar clave?" description="La clave actual dejará de funcionar." onConfirm={handleRegenerateKey} okText="Sí" cancelText="No">
                  <Button icon={<ReloadOutlined />} loading={saving}>{apiKey ? 'Regenerar' : 'Generar'}</Button>
                </Popconfirm>
              </Input.Group>
            </Card>

            <Card size="small" title={<><CreditCardOutlined /> Configuración de Pagos</>}>
              <Form.Item name="enabledPaymentMethods" label="Métodos de Pago Habilitados">
                <Checkbox.Group options={Object.values(PaymentMethod).map((pm: string) => ({ label: pm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value: pm }))} />
              </Form.Item>
              <Form.Item name="mercadoPagoAccessToken" label="Access Token de Mercado Pago" tooltip="Encuentra esto en tu panel de desarrollador de Mercado Pago.">
                <Input.Password placeholder="Pega tu Access Token de Producción aquí" />
              </Form.Item>
            </Card>

            <Paragraph>
              Activa las integraciones con servicios externos para potenciar tu negocio.
            </Paragraph>
            <Form.Item name="isHexaFactIntegrationEnabled" valuePropName="checked">
              <Checkbox>Habilitar integración con HexaFact para facturación electrónica</Checkbox>
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.isHexaFactIntegrationEnabled !== currentValues.isHexaFactIntegrationEnabled ||
                prevValues.invoicingAppUrl !== currentValues.invoicingAppUrl
              }
            >
              {({ getFieldValue }) =>
                getFieldValue('isHexaFactIntegrationEnabled') && getFieldValue('invoicingAppUrl') && (
                  <Form.Item label="URL del Portal de Facturación">
                    <Input readOnly value={getFieldValue('invoicingAppUrl')} addonAfter={<Button type="text" size="small" onClick={() => navigator.clipboard.writeText(getFieldValue('invoicingAppUrl'))}>Copiar</Button>} />
                  </Form.Item>
                )
              }
            </Form.Item>
          </Collapse.Panel>

          <Collapse.Panel header="Redes Sociales y Web" key="social">
            <Row gutter={16}>
              <Col xs={24} md={12}><Form.Item name="website" label="Sitio Web"><Input type="url" /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="facebook" label="Facebook"><Input type="url" /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="instagram" label="Instagram"><Input type="url" /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="tiktok" label="TikTok"><Input type="url" /></Form.Item></Col>
            </Row>
          </Collapse.Panel>
        </Collapse>

        <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
          <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
            Guardar Configuración
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SettingsPage;