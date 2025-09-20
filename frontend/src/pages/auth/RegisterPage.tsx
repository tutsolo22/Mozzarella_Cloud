import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../services/api';

const { Title } = Typography;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      await register(values);
      message.success(
        '¡Registro exitoso! Revisa tu correo para activar tu cuenta.',
      );
      navigate('/login');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Ocurrió un error durante el registro.';
      message.error(errorMessage);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#333333', // Fondo oscuro de la marca
      }}
    >
      <Card
        style={{
          width: 400,
          background: '#262626', // Color de contenedor oscuro
          border: '1px solid #DAA520', // Borde dorado
          boxShadow: '0 8px 16px 0 rgba(0,0,0,0.5)',
        }}
      >
        <Title level={2} style={{ textAlign: 'center', color: '#DAA520' }}>
          Crear Cuenta en Mozzarella Cloud
        </Title>
        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          requiredMark="optional"
          labelCol={{ style: { color: '#F5F5DC' } }} // Color de etiquetas para tema oscuro
        >
          <Form.Item
            name="tenantName"
            label="Nombre del Negocio"
            rules={[{ required: true, message: 'Por favor, ingresa el nombre de tu negocio.' }]}
          >
            <Input placeholder="Ej: Pizzería Don Carlo" />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Tu Nombre Completo"
            rules={[{ required: true, message: 'Por favor, ingresa tu nombre completo.' }]}
          >
            <Input placeholder="Ej: Juan Pérez" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Correo Electrónico"
            rules={[{ required: true, message: 'Por favor, ingresa tu correo.' }, { type: 'email', message: 'El correo no es válido.' }]}
          >
            <Input placeholder="tu@correo.com" />
          </Form.Item>

          <Form.Item name="password" label="Contraseña" rules={[{ required: true, message: 'Por favor, ingresa tu contraseña.' }]} hasFeedback>
            <Input.Password />
          </Form.Item>

          <Form.Item name="confirm" label="Confirmar Contraseña" dependencies={['password']} hasFeedback rules={[{ required: true, message: 'Por favor, confirma tu contraseña.' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) { return Promise.resolve(); } return Promise.reject(new Error('Las contraseñas no coinciden.')); }, })]}>
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Crear Cuenta
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', color: '#F5F5DC' }}>
            ¿Ya tienes una cuenta? <Link to="/login" style={{ color: '#DAA520' }}>Inicia sesión</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;