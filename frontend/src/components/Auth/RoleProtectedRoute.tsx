import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spin, Result, Button } from 'antd';
import { RoleEnum } from '../../roles/enums/role.enum';

interface RoleProtectedRouteProps {
  allowedRoles: RoleEnum[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Verificando sesión..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está autenticado, verificamos si su rol está permitido
  const isAuthorized = user && allowedRoles.includes(user.role as RoleEnum);

  if (!isAuthorized) {
    // Si no está autorizado, mostramos una página de "Acceso Denegado"
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;