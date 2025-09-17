import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, notification } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { requestPasswordReset } from '../../services/api';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      await requestPasswordReset(values.email);
      notification.success({
        message: 'Petición Enviada',
        description: 'Si tu correo está registrado, recibirás un enlace para resetear tu contraseña en unos minutos.',
        duration: 10,
      });
    } catch (error) {
      // No mostramos el error para no revelar si un email existe o no
      notification.success({
        message: 'Petición Enviada',
        description: 'Si tu correo está registrado, recibirás un enlace para resetear tu contraseña en unos minutos.',
        duration: 10,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: 'center' }}>Recuperar Contraseña</Title>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
          Ingresa tu correo electrónico y te enviaremos un enlace para resetear tu contraseña.
        </Text>
        <Form name="forgot_password" onFinish={onFinish}>
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Por favor, ingresa un correo válido' }]}>
            <Input prefix={<MailOutlined />} placeholder="Correo electrónico" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Enviar Enlace de Reseteo
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Link to="/login">Volver a Iniciar Sesión</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;