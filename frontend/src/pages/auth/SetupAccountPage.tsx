import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message, Card, Typography, Spin, Result } from 'antd';
import { setupAccount } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { LockOutlined } from '@ant-design/icons';
const { Title, Paragraph } = Typography;

const SetupAccountPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('No se proporcionó un token de configuración. Por favor, revisa el enlace en tu correo.');
    }
  }, [searchParams]);

  const onFinish = async (values: any) => {
    if (!token) return;
    setLoading(true);
    try {
      const { access_token, user } = await setupAccount(token, values.password);
      message.success('¡Tu cuenta ha sido configurada con éxito! Iniciando sesión...');
      setAuth(access_token, user);
      navigate(user.role.name === 'super_admin' ? '/super-admin/tenants' : '/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ocurrió un error al configurar tu cuenta.';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Result
        status="error"
        title="Error de Configuración"
        subTitle={error}
        extra={
          <Button type="primary">
            <Link to="/login">Volver al inicio de sesión</Link>
          </Button>
        }
        style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      />
    );
  }

  if (!token) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} />;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#333333' }}>
      <Card style={{ width: 400, background: '#000000', border: '1px solid #DAA520' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ color: '#DAA520' }}>Configura tu Cuenta</Title>
          <Paragraph style={{ color: '#F5F5DC' }}>¡Bienvenido! Por favor, establece una contraseña para tu cuenta.</Paragraph>
        </div>
        <Form name="setup_account" onFinish={onFinish} layout="vertical" requiredMark="optional">
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Por favor, introduce tu contraseña.' },
              { min: 8, message: 'La contraseña debe tener al menos 8 caracteres.' },
            ]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nueva Contraseña" />
          </Form.Item>
          <Form.Item name="confirm" dependencies={['password']} hasFeedback rules={[{ required: true, message: 'Por favor, confirma tu contraseña.' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) { return Promise.resolve(); } return Promise.reject(new Error('Las dos contraseñas no coinciden.')); }, })]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Confirmar Contraseña" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Establecer Contraseña y Acceder
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SetupAccountPage;