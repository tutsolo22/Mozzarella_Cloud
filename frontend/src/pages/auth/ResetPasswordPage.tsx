import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, notification, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { resetPassword } from '../../services/api';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const ResetPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (!urlToken) {
      notification.error({
        message: 'Token no encontrado',
        description: 'El enlace de reseteo no es válido o está incompleto.',
      });
      navigate('/login');
      return;
    }
    setToken(urlToken);
  }, [searchParams, navigate]);

  const onFinish = async (values: any) => {
    if (!token) return;

    setLoading(true);
    try {
      await resetPassword(token, values.password);
      notification.success({
        message: 'Contraseña Actualizada',
        description: 'Tu contraseña ha sido actualizada con éxito. Ya puedes iniciar sesión.',
      });
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'El token es inválido o ha expirado. Por favor, solicita un nuevo enlace.';
      notification.error({
        message: 'Error al resetear',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#333333' }}>
      <Card style={{ width: 400, background: '#000000', border: '1px solid #DAA520' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ color: '#DAA520' }}>Establecer Nueva Contraseña</Title>
        </div>
        <Form name="reset_password" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Por favor, ingresa tu nueva contraseña' }, { min: 8, message: 'La contraseña debe tener al menos 8 caracteres' }]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nueva Contraseña" />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Por favor, confirma tu contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las dos contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirmar Nueva Contraseña" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Actualizar Contraseña
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Link to="/login" style={{ color: '#DAA520' }}>Volver a Iniciar Sesión</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;