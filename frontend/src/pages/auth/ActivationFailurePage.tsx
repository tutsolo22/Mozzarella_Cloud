import { Button, Result } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const getErrorMessage = (errorCode: string | null) => {
  if (!errorCode) {
    return {
      title: 'Ocurrió un error inesperado',
      subTitle: 'Por favor, intenta de nuevo más tarde o contacta a soporte.',
    };
  }
  switch (errorCode) {
    case 'Esta cuenta ya ha sido verificada.':
      return {
        title: 'Esta cuenta ya ha sido activada',
        subTitle: 'No es necesario verificarla de nuevo. Puedes iniciar sesión directamente.',
      };
    case 'El token de verificación es inválido o ha expirado.':
      return {
        title: 'El enlace de activación es inválido o ha expirado',
        subTitle: 'Por favor, solicita un nuevo correo de activación o contacta a soporte.',
      };
    default:
      return {
        title: 'No se pudo activar tu cuenta',
        subTitle: `Ocurrió un error durante el proceso. (${errorCode})`,
      };
  }
};

const ActivationFailurePage = () => {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState({ title: '', subTitle: '' });

  useEffect(() => {
    const errorCode = searchParams.get('error');
    setMessages(getErrorMessage(errorCode));
  }, [searchParams]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Result status="error" title={messages.title} subTitle={messages.subTitle} extra={[<Link to="/login" key="login"><Button type="primary">Ir a Iniciar Sesión</Button></Link>]} />
    </div>
  );
};

export default ActivationFailurePage;