import React from 'react';
import { Typography, Result } from 'antd';

const { Title } = Typography;

const PreparationZonesPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>Gestión de Zonas de Preparación</Title>
      <Result
        status="info"
        title="Página en Construcción"
        subTitle="Esta funcionalidad para gestionar las zonas de preparación estará disponible próximamente."
      />
    </div>
  );
};

export default PreparationZonesPage;