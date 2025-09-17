import React from 'react';
import { Form, Input, Button, message, Card, Typography, Row, Col, Modal, Spin } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { changePassword, updateMyProfile } from '../../services/api';
import { LockOutlined, SaveOutlined, SyncOutlined } from '@ant-design/icons';
import { UpdateProfileDto, User } from '../../types/user';

const { Title } = Typography;

const ProfilePage: React.FC = () => {
  const { user, setUser, loading: authLoading } = useAuth();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [profileLoading, setProfileLoading] = React.useState(false);
  const [passwordLoading, setPasswordLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({ fullName: user.fullName, email: user.email });
    }
  }, [user, profileForm]);

  const onUpdateProfile = async (values: UpdateProfileDto) => {
    setProfileLoading(true);
    try {
      const updatedUser = await updateMyProfile(values);
      setUser((prevUser: User | null) => (prevUser ? { ...prevUser, ...updatedUser } : null));
      message.success('Perfil actualizado con éxito.');
    } catch (error) {
      message.error('Error al actualizar el perfil.');
      console.error(error);
    } finally {
      setProfileLoading(false);
    }
  };

  const onChangePassword = async (values: any) => {
    setPasswordLoading(true);
    try {
      await changePassword({ oldPassword: values.oldPassword, newPassword: values.newPassword });
      message.success('Contraseña cambiada con éxito.');
      passwordForm.resetFields();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al cambiar la contraseña.';
      message.error(errorMessage);
      console.error(error);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleGeneratePassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    const allChars = upper + lower + numbers + symbols;
    const length = 14;
    
    let password = '';
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    const shuffledPassword = password.split('').sort(() => 0.5 - Math.random()).join('');

    passwordForm.setFieldsValue({
      newPassword: shuffledPassword,
      confirmPassword: shuffledPassword,
    });

    Modal.info({
      title: 'Contraseña Generada',
      content: (
        <div>
          <p>Se ha generado una nueva contraseña segura. Cópiala y guárdala en un lugar seguro antes de continuar.</p>
          <Input.Search
            readOnly
            value={shuffledPassword}
            enterButton="Copiar"
            onSearch={(value) => {
              navigator.clipboard.writeText(value);
              message.success('Contraseña copiada al portapapeles.');
            }}
          />
        </div>
      ),
      okText: 'Entendido',
    });
  };

  if (authLoading || !user) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} />;
  }

  return (
    <>
      <Title level={2}>Mi Perfil</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Información del Perfil">
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={onUpdateProfile}
              initialValues={{ fullName: user.fullName, email: user.email }}
            >
              <Form.Item
                name="fullName"
                label="Nombre Completo"
                rules={[{ required: true, message: 'Por favor, introduce tu nombre completo.' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="email"
                label="Correo Electrónico"
              >
                <Input readOnly disabled />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={profileLoading} icon={<SaveOutlined />}>
                  Guardar Nombre
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Cambiar Contraseña">
            <Form form={passwordForm} layout="vertical" onFinish={onChangePassword}>
              <Form.Item name="oldPassword" label="Contraseña Actual" rules={[{ required: true, message: 'Por favor, introduce tu contraseña actual.' }]}>
                <Input.Password />
              </Form.Item>
              <Form.Item name="newPassword" label="Nueva Contraseña" rules={[{ required: true, message: 'Por favor, introduce tu nueva contraseña.' }, { min: 8, message: 'La contraseña debe tener al menos 8 caracteres.' }]} hasFeedback>
                <Input.Password placeholder="Introduce la nueva contraseña o genera una" />
              </Form.Item>
              <Form.Item name="confirmPassword" label="Confirmar Nueva Contraseña" dependencies={['newPassword']} hasFeedback rules={[{ required: true, message: 'Por favor, confirma tu nueva contraseña.' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) { return Promise.resolve(); } return Promise.reject(new Error('Las dos contraseñas no coinciden.')); }, })]}>
                <Input.Password />
              </Form.Item>
              <Form.Item>
                <Button onClick={handleGeneratePassword} icon={<SyncOutlined />} style={{ marginRight: 8 }}>
                  Generar Contraseña
                </Button>
                <Button type="primary" htmlType="submit" loading={passwordLoading} icon={<LockOutlined />}>
                  Cambiar Contraseña
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProfilePage;