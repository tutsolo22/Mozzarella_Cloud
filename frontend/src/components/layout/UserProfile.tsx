import React from 'react';
import { Avatar, Dropdown, MenuProps, Space, Typography } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Text } = Typography;

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  const items: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
      <Space style={{ cursor: 'pointer' }}>
        <Avatar icon={<UserOutlined />} />
        <Text>{user.fullName}</Text>
      </Space>
    </Dropdown>
  );
};

export default UserProfile;