import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  // 1. Obtenemos la función `login` de nuestro contexto de autenticación.
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 2. Esta función se ejecuta cuando el formulario se envía.
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // 3. Llamamos a la función `login` con las credenciales del formulario.
      // Esta función ya se encarga de la petición, guardar el token y actualizar el estado.
      await login({ email: values.email, password: values.password });

      // 4. Si el login es exitoso, redirigimos al usuario al dashboard.
      // Cambiamos '/admin' a '/' para que coincida con nuestra ProtectedRoute.
      navigate('/');
    } catch (error: any) {
      // 5. Si hay un error (ej. credenciales incorrectas), mostramos un mensaje.
      // El AuthContext se encarga de lanzar el error si la API falla.
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión. Por favor, inténtalo de nuevo.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2}>Mozzarella Cloud</Title>
        </div>
        <Form name="login" onFinish={onFinish} autoComplete="off">
          <Form.Item name="email" rules={[{ required: true, message: 'Por favor, introduce tu email' }]}>
            <Input prefix={<UserOutlined />} placeholder="Email" type="email" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Por favor, introduce tu contraseña' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" />
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