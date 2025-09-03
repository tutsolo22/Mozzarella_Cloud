import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface CanProps {
  perform: string;
  children: React.ReactNode;
}

const Can: React.FC<CanProps> = ({ perform, children }) => {
  const { hasPermission } = useAuth();

  // Si el usuario tiene el permiso, renderiza los hijos. Si no, no renderiza nada.
  return hasPermission(perform) ? <>{children}</> : null;
};

export default Can;