import React, { createContext, useContext } from 'react';

interface FieldMappingContextType {
  featureName: string;
}

const FieldMappingContext = createContext<FieldMappingContextType | undefined>(undefined);

export interface FieldMappingProviderProps {
  featureName: string;
  children: React.ReactNode;
}

export function FieldMappingProvider({ featureName, children }: FieldMappingProviderProps) {
  return (
    <FieldMappingContext.Provider value={{ featureName }}>
      {children}
    </FieldMappingContext.Provider>
  );
}

export function useFieldMappingContext(): FieldMappingContextType {
  const context = useContext(FieldMappingContext);
  if (!context) {
    throw new Error('useFieldMappingContext must be used within FieldMappingProvider');
  }
  return context;
}
