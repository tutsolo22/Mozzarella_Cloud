import React from 'react';
import { Select, Space, Spin } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import { useLocations } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';
import { RoleEnum } from '../../types/role.enum';

const { Option } = Select;

const LocationSelector: React.FC = () => {
  const { locations, selectedLocation, switchLocation, loading } = useLocations();
  const { user } = useAuth();

  if (user?.role !== RoleEnum.Admin || locations.length <= 1) {
    return null;
  }

  const handleChange = (locationId: string) => {
    if (locationId !== selectedLocation?.id) {
      switchLocation(locationId);
    }
  };

  if (loading && !selectedLocation) {
    return <Spin size="small" />;
  }

  return (
    <Space>
      <ShopOutlined />
      <Select
        value={selectedLocation?.id}
        onChange={handleChange}
        style={{ width: 200 }}
        bordered={false}
        placeholder="Seleccionar sucursal"
      >
        {locations.map((loc) => <Option key={loc.id} value={loc.id}>{loc.name}</Option>)}
      </Select>
    </Space>
  );
};

export default LocationSelector;