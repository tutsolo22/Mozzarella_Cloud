import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Row, Col, message, Spin, InputNumber, Switch, Space } from 'antd';
import { SaveOutlined, MailOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { getSmtpSettings, saveSmtpSettings, testSmtpConnection, sendConfiguredTestEmail } from '../../services/api';
import { TestSmtpDto } from '../../types/smtp';

const { Title, Paragraph } = Typography;

const SmtpSettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [testEmailForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testConnectionLoading, setTestConnectionLoading] = useState(false);
  const [sendEmailLoading, setSendEmailLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSmtpSettings();
        if (settings) {
          form.setFieldsValue(settings);
        }
      } catch (error) {
        message.error('No se pudo cargar la configuración SMTP guardada.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [form]);

  const handleTestConnection = async () => {
    try {
      const values = await form.validateFields();
      setTestConnectionLoading(true);
      const response = await testSmtpConnection(values);
      if (response.success) {
        message.success(response.message);
      } else {
        message.error(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al probar la conexión. Revisa los datos.';
      message.error(errorMessage);
    } finally {
      setTestConnectionLoading(false);
    }
  };

  const handleSendTestEmail = async (values: { email: string }) => {
    setSendEmailLoading(true);
    try {
      const response = await sendConfiguredTestEmail(values.email);
      message.success(response.message);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al enviar el correo de prueba.';
      message.error(errorMessage);
    } finally {
      setSendEmailLoading(false);
    }
  };

  const handleSaveSettings = async (values: TestSmtpDto) => {
    setSaving(true);
    try {
      await saveSmtpSettings(values);
      message.success('Configuración SMTP guardada con éxito.');
      // Recargar la configuración para mostrar el placeholder de la contraseña
      const settings = await getSmtpSettings();
      if (settings) {
        form.setFieldsValue(settings);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al guardar la configuración.';
      message.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spin tip="Cargando configuración..." />;
  }

  return (
    <>
      <Title level={2}>Configuración de Correo (SMTP)</Title>
      <Paragraph>
        Gestiona la configuración del servidor de correo para el envío de notificaciones, invitaciones y recuperación de contraseñas.
      </Paragraph>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16} xl={12}>
          <Card title="Configuración del Servidor">
            <Form<TestSmtpDto> form={form} layout="vertical" onFinish={handleSaveSettings}>
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item name="host" label="Host" rules={[{ required: true, message: 'El host es obligatorio.' }]}>
                    <Input placeholder="smtp.example.com" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="port" label="Puerto" rules={[{ required: true, message: 'El puerto es obligatorio.' }]}>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="user" label="Usuario" rules={[{ required: true, message: 'El usuario es obligatorio.' }]}>
                <Input placeholder="user@example.com" />
              </Form.Item>
              <Form.Item name="pass" label="Contraseña" help="Deja este campo sin modificar para conservar la contraseña actual.">
                <Input.Password placeholder="Introduce una nueva contraseña para cambiarla" />
              </Form.Item>
              <Form.Item name="secure" label="Usar Conexión Segura (SSL/TLS)" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
                    Guardar Configuración
                  </Button>
                  <Button onClick={handleTestConnection} loading={testConnectionLoading} icon={<ThunderboltOutlined />}>
                    Probar Conexión
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={8} xl={12}>
          <Card title="Enviar Correo de Prueba">
            <Title level={5}>Enviar Correo de Prueba</Title>
            <Paragraph type="secondary">
              Introduce un email y haz clic en "Enviar" para mandar un correo de prueba usando la <strong>configuración guardada</strong> en la base de datos.
            </Paragraph>
            <Form form={testEmailForm} onFinish={handleSendTestEmail} layout="vertical">
              <Form.Item name="email" label="Dirección de Email de Destino" rules={[{ required: true, type: 'email', message: 'Introduce un email válido.' }]}>
                <Input placeholder="test@example.com" />
              </Form.Item>
              <Form.Item>
                <Button type="default" htmlType="submit" loading={sendEmailLoading} icon={<MailOutlined />}>
                  Enviar
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default SmtpSettingsPage;