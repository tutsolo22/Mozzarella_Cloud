import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getMyLocations } from '../services/locations';
import { switchLocation as switchLocationApi } from '../services/auth';
import { Location } from '../types/location';
import { User } from '../types/user';

interface LocationContextType {
  locations: Location[];
  selectedLocation: Location | null;
  switchLocation: (locationId: string) => Promise<void>;
  loading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setToken, isAuthenticated } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLocations = useCallback(async () => {
    if (isAuthenticated && user) {
      try {
        setLoading(true);
        const userLocations = await getMyLocations();
        setLocations(userLocations);
        
        const currentLocation = userLocations.find(loc => loc.id === (user as User).locationId) || userLocations[0] || null;
        setSelectedLocation(currentLocation);

      } catch (error) {
        console.error("Failed to fetch locations", error);
      } finally {
        setLoading(false);
      }
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const switchLocation = async (locationId: string) => {
    try {
      const { access_token } = await switchLocationApi(locationId);
      setToken(access_token, () => {
        window.location.reload();
      });
    } catch (error) {
      console.error("Failed to switch location", error);
    }
  };

  const value = { locations, selectedLocation, switchLocation, loading };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocations = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocations must be used within a LocationProvider');
  }
  return context;
};