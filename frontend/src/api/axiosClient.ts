import axios from 'axios';

// La URL base de tu API, obtenida de las variables de entorno de Vite
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Interceptor de Petición:
 * Se ejecuta antes de que cada petición sea enviada.
 * Su trabajo es tomar el token del localStorage y añadirlo al encabezado 'Authorization'.
 */
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Añade el encabezado a la configuración de la petición
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Interceptor de Respuesta:
 * Se ejecuta cuando se recibe una respuesta (o un error).
 * Si el error es un 401 (Unauthorized), significa que el token es inválido o ha expirado.
 * En ese caso, borramos los datos de sesión y forzamos una recarga a la página de login.
 */
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login'; // Redirección forzada para limpiar estado
    }
    return Promise.reject(error);
  },
);

export default axiosClient;