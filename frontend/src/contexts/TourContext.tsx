import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface TourContextType {
  isTourRunning: boolean;
  stepIndex: number;
  startTour: () => void;
  stopTour: () => void;
  setStepIndex: (index: number) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const startTour = useCallback(() => {
    setStepIndex(0); // Asegura que el tour siempre comience desde el principio
    // Pequeño timeout para asegurar que todos los elementos del DOM estén listos
    setTimeout(() => setIsTourRunning(true), 100);
  }, []);

  const stopTour = useCallback(() => {
    setIsTourRunning(false);
  }, []);

  return (
    <TourContext.Provider value={{ isTourRunning, stepIndex, startTour, stopTour, setStepIndex }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = (): TourContextType => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour debe ser usado dentro de un TourProvider');
  }
  return context;
};