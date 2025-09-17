import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Spin, message, Result } from 'antd';
import { Link } from 'react-router-dom';
import { DesktopOutlined } from '@ant-design/icons';
import { getPreparationZones } from '../../services/preparationZones';
import { PreparationZone } from '../../types/preparation-zone';

const { Title, Text } = Typography;

const KDSSelectorPage: React.FC = () => {
  const [zones, setZones] = useState<PreparationZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const zonesData = await getPreparationZones();
        setZones(zonesData);
      } catch (error) {
        message.error('Error al cargar las zonas de preparación.');
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, []);

  if (loading) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }} />;
  }

  if (zones.length === 0) {
    return (
      <Result
        status="info"
        title="No hay Zonas de Preparación Configurada"
        subTitle="Por favor, crea al menos una zona en 'Gestión > Zonas de Preparación' para poder usar el KDS."
        extra={<Link to="/management/preparation-zones"><Button type="primary">Configurar Zonas</Button></Link>}
      />
    );
  }

  return (
    <div>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '2rem' }}>Selecciona una Zona de Preparación</Title>
      <Row gutter={[16, 16]} justify="center">
        {zones.map(zone => (
          <Col key={zone.id} xs={24} sm={12} md={8} lg={6}>
            <Link to={`/kds/${zone.id}`}>
              <Card hoverable style={{ textAlign: 'center' }}>
                <DesktopOutlined style={{ fontSize: '48px', marginBottom: '1rem' }} />
                <Title level={4}>{zone.name}</Title>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default KDSSelectorPage;