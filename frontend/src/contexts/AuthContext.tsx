import React, { createContext, useState, useContext, useEffect, ReactNode, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LoginCredentials } from '../types/user';
import * as api from '../services/api';
import axiosClient from '../api/axiosClient';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Extendemos JwtPayload para definir la estructura de nuestro token
interface DecodedToken extends JwtPayload {
  email: string;
  fullName: string;
  role: string; // El token tiene el nombre del rol como string
  tenantId: string;
  permissions: string[];
  sub?: string;
  locationId?: string | null;
}

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        // Reconstruimos el objeto User a partir del token decodificado
        const userFromToken: User = {
          id: decodedToken.sub!,
          email: decodedToken.email,
          fullName: decodedToken.fullName,
          role: {
            name: decodedToken.role,
          },
          permissions: decodedToken.permissions,
          locationId: decodedToken.locationId,
        };
        setUser(userFromToken);
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error("Token inválido", error);
        localStorage.removeItem('access_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const { access_token, user: loggedInUser } = await api.login(credentials);
    localStorage.setItem('access_token', access_token);
    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setUser(loggedInUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    delete axiosClient.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};