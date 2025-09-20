import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Location } from '../types/location';
import { getMyLocations } from '../services/locations';
import { useAuth } from './AuthContext';
import { message } from 'antd';

interface LocationContextType {
  availableLocations: Location[];
  currentLocationId: string | null;
  switchLocation: (locationId: string) => Promise<void>;
  loading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, switchUserLocation } = useAuth();
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(user?.locationId || null);
  const [loading, setLoading] = useState(true);

  const switchLocation = useCallback(async (locationId: string) => {
    try {
      await switchUserLocation(locationId);
      message.success('Sucursal cambiada con éxito. La página se recargará.');
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      message.error('Error al cambiar de sucursal.');
      console.error(error);
    }
  }, [switchUserLocation]);

  useEffect(() => {
    let isMounted = true;
    setCurrentLocationId(user?.locationId || null);

    if (user && (user.role.name === 'admin' || user.role.name === 'super_admin')) {
      setLoading(true);
      getMyLocations()
        .then(locations => {
          if (isMounted) {
            // Asegurarnos de que siempre sea un array para evitar errores.
            setAvailableLocations(Array.isArray(locations) ? locations : []);
            // Si un admin no tiene sucursal asignada, lo asignamos a la primera disponible.
            if (!user.locationId && locations.length > 0) {
              // Esto refrescará el token y recargará la página para aplicar el cambio.
              switchLocation(locations[0].id);
            } else {
              setLoading(false);
            }
          }
        })
        .catch(() => {
          if (isMounted) {
            message.error('No se pudieron cargar las sucursales.');
            setLoading(false);
          }
        });
    } else if (user) {
      if (user.location) {
        setAvailableLocations([user.location]);
      }
      setLoading(false);
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user, switchLocation]);

  return (
    <LocationContext.Provider value={{ availableLocations, currentLocationId, switchLocation, loading }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};