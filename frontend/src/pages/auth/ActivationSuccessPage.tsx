import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';

const ActivationSuccessPage = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Result
        status="success"
        title="¡Tu cuenta ha sido activada con éxito!"
        subTitle="Ya puedes iniciar sesión para empezar a gestionar tu negocio."
        extra={[
          <Link to="/login" key="login">
            <Button type="primary">Ir a Iniciar Sesión</Button>
          </Link>,
        ]}
      />
    </div>
  );
};

export default ActivationSuccessPage;