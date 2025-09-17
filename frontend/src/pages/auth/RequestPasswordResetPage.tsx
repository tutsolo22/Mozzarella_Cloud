import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { requestPasswordReset } from '../../services/api';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const RequestPasswordResetPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      const response = await requestPasswordReset(values.email);
      message.success(response.message);
      setEmailSent(true);
    } catch (error: any) {
      // Mostramos un mensaje genérico incluso si hay un error para no revelar si un email existe o no.
      // El backend ya maneja esto, pero es una buena práctica en el frontend también.
      message.success('Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.');
      setEmailSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#333333' }}>
      <Card style={{ width: 400, background: '#000000', border: '1px solid #DAA520' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ color: '#DAA520' }}>Recuperar Contraseña</Title>
        </div>

        {emailSent ? (
          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: '#F5F5DC' }}>Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña en unos minutos. Por favor, revisa tu bandeja de entrada (y la carpeta de spam).</Text>
            <Button type="primary" style={{ marginTop: 20, width: '100%' }}><Link to="/login" style={{ color: 'inherit' }}>Volver al Login</Link></Button>
          </div>
        ) : (
          <>
            <Text style={{ color: '#F5F5DC' }}>Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</Text>
            <Form name="request-password-reset" onFinish={onFinish} style={{ marginTop: 20 }}>
              <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Por favor, introduce un correo válido' }]}>
                <Input prefix={<MailOutlined />} placeholder="Correo electrónico" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>Enviar enlace de recuperación</Button>
              </Form.Item>
              <div style={{ textAlign: 'center' }}><Link to="/login" style={{ color: '#DAA520' }}>Volver al Login</Link></div>
            </Form>
          </>
        )}
      </Card>
    </div>
  );
};

export default RequestPasswordResetPage;