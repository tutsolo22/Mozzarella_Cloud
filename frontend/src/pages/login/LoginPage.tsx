import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const reason = sessionStorage.getItem('logout_reason');
    if (reason === 'expired') {
      message.warning('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
      // Limpiamos la razón para que no vuelva a aparecer si se recarga la página
      sessionStorage.removeItem('logout_reason');
    }
  }, []);

  // 2. Esta función se ejecuta cuando el formulario se envía.
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await login({ email: values.email, password: values.password, remember: values.remember });
      // La redirección ahora es manejada por MainLayout después de que el contexto de autenticación se actualiza.
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión. Por favor, inténtalo de nuevo.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#333333' }}>
      <Card style={{ width: 400, background: '#000000', border: '1px solid #DAA520' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ color: '#DAA520' }}>Mozzarella Cloud</Title>
          <Text style={{ color: '#F5F5DC' }}>Optimiza tu negocio de alimentos con la máxima eficiencia y control.</Text>
        </div>
        <Form name="login" onFinish={onFinish} autoComplete="off" initialValues={{ remember: true }}>
          <Form.Item name="email" rules={[{ required: true, message: 'Por favor, introduce tu email' }]}>
            <Input prefix={<UserOutlined />} placeholder="Email" type="email" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Por favor, introduce tu contraseña' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" />
          </Form.Item>

          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox style={{ color: '#F5F5DC' }}>Mantener sesión iniciada</Checkbox>
            </Form.Item>

            <Link to="/request-password-reset" style={{ float: 'right', color: '#DAA520' }}>¿Olvidaste tu contraseña?</Link>

          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;