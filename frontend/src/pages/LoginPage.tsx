import React, { useEffect } from 'react';
import { Button, Form, Input, Card, Typography, notification } from 'antd';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      notification.success({
        message: '¡Correo Verificado!',
        description: 'Tu cuenta ha sido activada. Ahora puedes iniciar sesión.',
      });
    }
  }, [searchParams]);
  const onFinish = async (values: any) => {
    try {
      const response = await api.post<{ access_token: string; user: { role: string } }>('/auth/login', values);
      const { access_token, user } = response.data;
      localStorage.setItem('access_token', access_token);

      if (user.role === 'super-admin') {
        navigate('/super-admin/tenants');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      notification.error({
        message: 'Error de Inicio de Sesión',
        description: error.response?.data?.message || 'El email o la contraseña son incorrectos.',
      });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: 'center' }}>Iniciar Sesión</Title>
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Por favor ingrese su email!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[{ required: true, message: 'Por favor ingrese su contraseña!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Ingresar
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            ¿No tienes una cuenta? <Link to="/register">Crea un restaurante</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;