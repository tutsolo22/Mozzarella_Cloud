import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User, LoginCredentials } from '../types/user';
import * as api from '../services/api';
import axiosClient from '../api/axiosClient';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  switchUserLocation: (locationId: string) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.getProfile()
        .then(profile => {
          setUser(profile);
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
    setUser(userToSet);
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

  const value = { isAuthenticated: !!user, user, loading, login, setAuth, logout, switchUserLocation, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};