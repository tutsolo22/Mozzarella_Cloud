import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spin } from 'antd';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Muestra un spinner de carga mientras el AuthContext verifica el token inicial.
    // Esto previene un parpadeo a la página de login si el usuario ya tiene una sesión válida.
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Verificando sesión..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Si el usuario no está autenticado, lo redirigimos a la página de login.
    // `replace` evita que el usuario pueda volver a la página anterior con el botón de retroceso.
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está autenticado, renderiza el componente hijo (la página protegida).
  // <Outlet /> es un componente de react-router-dom que renderiza la ruta anidada correspondiente.
  return <Outlet />;
};

export default ProtectedRoute;