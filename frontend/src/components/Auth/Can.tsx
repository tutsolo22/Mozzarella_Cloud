import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface CanProps {
  children: ReactNode;
  permission: string;
}

export const Can = ({ children, permission }: CanProps) => {
  const { hasPermission } = useAuth();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return null;
};