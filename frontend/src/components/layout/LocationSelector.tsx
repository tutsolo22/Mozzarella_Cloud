import React from 'react';
import { Select, Spin, Typography } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { useLocationContext } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';

const { Text } = Typography;

const LocationSelector: React.FC = () => {
  const { availableLocations, currentLocationId, switchLocation, loading } = useLocationContext();
  const { user } = useAuth();

  if (loading) {
    return <Spin size="small" />;
  }

  // No mostrar el selector si hay una o ninguna sucursal.
  if (!user || availableLocations.length <= 1) {
    const locationName = availableLocations.length === 1 ? availableLocations[0].name : 'Sin sucursal';
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(0, 0, 0, 0.85)' }}>
            <EnvironmentOutlined />
            <Text>{locationName}</Text>
        </div>
    );
  }

  return (
    <Select
      value={currentLocationId}
      onChange={switchLocation}
      style={{ width: 200 }}
      bordered={false}
      options={availableLocations.map(loc => ({
        value: loc.id,
        label: (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><EnvironmentOutlined /> {loc.name}</span>
        )
      }))}
    />
  );
};

export default LocationSelector;