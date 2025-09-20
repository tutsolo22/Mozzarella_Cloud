import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User, LoginCredentials } from '../types/user';
import * as api from '../services/api';
import axiosClient from '../api/axiosClient';

// 1. Definimos un tipo "mejorado" que incluye el método que necesitamos.
interface EnhancedUser extends User {
  hasPermission: (permission: string) => boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: EnhancedUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  switchUserLocation: (locationId: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

// Mover la función auxiliar fuera del componente para que no se recree en cada render.
const enhanceUser = (baseUser: User): EnhancedUser => {
  return {
    ...baseUser,
    // Le añadimos el método `hasPermission` que comprueba de forma segura si el array de permisos incluye el permiso solicitado.
    // Usamos `?.` (optional chaining) para evitar un error si `permissions` llegara a ser nulo o undefined.
    hasPermission: (permission: string) => !!baseUser.permissions?.includes(permission),
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<EnhancedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.getProfile()
        .then(userProfile => {
          // 3. Usamos la función auxiliar aquí al cargar el perfil.
          setUser(enhanceUser(userProfile));
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          delete axiosClient.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const setAuth = useCallback((token: string, userToSet: User) => {
    localStorage.setItem('access_token', token);
    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // 4. Y lo más importante, la usamos aquí, en la función que centraliza el login.
    setUser(enhanceUser(userToSet));
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { access_token, user: loggedInUser } = await api.login(credentials);
    setAuth(access_token, loggedInUser);
  }, [setAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    delete axiosClient.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.href = '/login';
  }, []);

  const switchUserLocation = useCallback(async (locationId: string) => {
    const { access_token, user: updatedUser } = await api.switchLocation(locationId);
    setAuth(access_token, updatedUser);
  }, [setAuth]);

  const hasPermission = useCallback((permission: string): boolean => {
    // Si no hay usuario, no hay permisos.
    if (!user) {
      return false;
    }
    // Usamos el método `hasPermission` que ya existe en nuestro objeto de usuario "mejorado".
    return user.hasPermission(permission);
  }, [user]);

  const value = { isAuthenticated: !!user, user, loading, login, setAuth, logout, switchUserLocation, hasPermission };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};