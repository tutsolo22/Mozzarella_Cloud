import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Spin, message } from 'antd';
import { verifyEmail } from '../../services/api';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status] = useState('Verificando tu cuenta, por favor espera...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      message.error('El enlace de verificación es inválido o está incompleto.');
      navigate('/login');
      return;
    }

    const performVerification = async () => {
      try {
        await verifyEmail(token);
        // En caso de éxito, redirigimos a la página de éxito.
        navigate('/activation-success');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Ocurrió un error al verificar tu cuenta.';
        // En caso de fallo, redirigimos a la página de fallo con el mensaje de error.
        navigate(`/activation-failure?error=${encodeURIComponent(errorMessage)}`);
      }
    };

    performVerification();
  }, [searchParams, navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" />
      <p style={{ marginTop: '20px', fontSize: '16px' }}>{status}</p>
    </div>
  );
};

export default VerifyEmailPage;