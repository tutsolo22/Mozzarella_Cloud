import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShopOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { register } from '../../services/api';
import styles from './RegisterPage.module.css';

const { Title } = Typography;

// Definimos una interfaz para los valores del formulario para mejorar la seguridad de tipos.
interface RegisterFormValues {
  tenantName: string;
  fullName: string;
  email: string;
  password: string;
  confirm: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: RegisterFormValues) => {
    // El objeto `values` del formulario incluye el campo `confirm` que solo se usa para validación en el frontend.
    // Debemos omitirlo antes de enviarlo al backend para evitar un error de validación (400 Bad Request).
    const { confirm, ...registerData } = values;
    setLoading(true);
    try {
      await register(registerData);
      message.success('¡Registro exitoso! Revisa tu correo para activar tu cuenta.');
      navigate('/login');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Ocurrió un error durante el registro.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.formContainer}>
        <Title level={2} className={styles.title}>
          Crear Cuenta en Mozzarella Cloud
        </Title>
        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          requiredMark="optional"
        >
          <Form.Item
            name="tenantName"
            label="Nombre del Negocio"
            rules={[{ required: true, message: 'Por favor, ingresa el nombre de tu negocio.' }]}
          >
            <Input
              prefix={<ShopOutlined className="site-form-item-icon" />}
              placeholder="Ej: Pizzería Don Carlo"
            />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Tu Nombre Completo"
            rules={[{ required: true, message: 'Por favor, ingresa tu nombre completo.' }]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Ej: Juan Pérez"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Correo Electrónico"
            rules={[
              { required: true, message: 'Por favor, ingresa tu correo.' },
              { type: 'email', message: 'El correo no es válido.' },
            ]}
          >
            <Input
              prefix={<MailOutlined className="site-form-item-icon" />}
              placeholder="tu@correo.com"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Contraseña"
            rules={[
              { required: true, message: 'Por favor, ingresa tu contraseña.' },
              { min: 8, message: 'La contraseña debe tener al menos 8 caracteres.' },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Contraseña"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirmar Contraseña"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Por favor, confirma tu contraseña.' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden.'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Confirmar contraseña"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Crear Cuenta
            </Button>
          </Form.Item>

          <div className={styles.footerText}>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className={styles.footerLink}>
              Inicia sesión
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default RegisterPage;