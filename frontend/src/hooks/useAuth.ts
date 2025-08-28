import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  email: string;
  sub: string;
  role: string;
  tenantId: string;
  iat: number;
  exp: number;
}

export const useAuth = () => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return { user: null, isAuthenticated: false };
  }

  try {
    const decodedToken: DecodedToken = jwtDecode(token);
    
    if (decodedToken.exp * 1000 < Date.now()) {
      localStorage.removeItem('access_token');
      return { user: null, isAuthenticated: false };
    }

    return { user: decodedToken, isAuthenticated: true };
  } catch (error) {
    console.error('Invalid token:', error);
    localStorage.removeItem('access_token');
    return { user: null, isAuthenticated: false };
  }
};