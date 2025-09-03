import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  return (
    <Result
      status="403"
      title="403"
      subTitle="Lo sentimos, no tienes permiso para acceder a esta página."
      extra={
        <Button type="primary"><Link to="/">Volver al Inicio</Link></Button>
      }
    />
  );
};

export default UnauthorizedPage;