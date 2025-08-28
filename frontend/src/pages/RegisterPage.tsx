import React from 'react';
import { Button, Form, Input, Card, Typography, notification } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

const { Title } = Typography;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      await api.post('/auth/register', values);
      notification.success({
        message: '¡Registro Exitoso!',
        description: 'Hemos enviado un enlace de verificación a tu correo electrónico. Por favor, revísalo para activar tu cuenta.',
        duration: 10, // Mensaje más largo
      });
      navigate('/login'); // Redirige a login para que espere la verificación
    } catch (error: any) {
      console.error('Registration failed:', error);
      notification.error({
        message: 'Error de Registro',
        description: error.response?.data?.message || 'Ocurrió un error. Por favor, intente de nuevo.',
      });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: 'center' }}>Crear Cuenta de Restaurante</Title>
        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            label="Nombre del Restaurante"
            name="tenantName"
            rules={[{ required: true, message: '¡Por favor ingrese el nombre de su restaurante!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Tu Nombre Completo"
            name="fullName"
            rules={[{ required: true, message: '¡Por favor ingrese su nombre completo!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Tu Email de Administrador"
            name="email"
            rules={[{ required: true, type: 'email', message: '¡Por favor ingrese un email válido!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[{ required: true, min: 8, message: '¡La contraseña debe tener al menos 8 caracteres!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Crear mi Restaurante
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;