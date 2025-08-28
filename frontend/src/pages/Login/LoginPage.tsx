import React from 'react';
import { Button, Form, Input, Card, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      // Hacemos la petición al endpoint de login del backend
      const response = await axios.post('http://localhost:3000/auth/login', {
        email: values.email,
        password: values.password,
      });

      const { access_token } = response.data;

      // Guardamos el token para futuras peticiones (por ahora en localStorage)
      localStorage.setItem('accessToken', access_token);

      message.success('¡Login exitoso!');

      // Redirigimos al usuario al dashboard principal
      navigate('/admin');
    } catch (error) {
      console.error('Error en el login:', error);
      message.error('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card title={<Title level={3}>Iniciar Sesión</Title>} style={{ width: 400 }}>
        <Form name="login" onFinish={onFinish} layout="vertical" autoComplete="off">
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Contraseña" name="password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>Ingresar</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;