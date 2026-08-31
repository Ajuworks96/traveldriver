import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AgencyBranding {
  agencyName: string;
  tagline: string;
  logoUrl?: string;
  primaryColor: string;
}

const defaultBranding: AgencyBranding = {
  agencyName: 'DriveSync Fleet',
  tagline: 'Travel & Driver Management System',
  primaryColor: '#2563EB',
};

interface BrandingContextType {
  branding: AgencyBranding;
  updateBranding: (newBranding: Partial<AgencyBranding>) => void;
  resetBranding: () => void;
}

const BrandingContext = createContext<BrandingContextType>({
  branding: defaultBranding,
  updateBranding: () => {},
  resetBranding: () => {},
});

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<AgencyBranding>(() => {
    const saved = localStorage.getItem('agency_branding');
    return saved ? JSON.parse(saved) : defaultBranding;
  });

  useEffect(() => {
    localStorage.setItem('agency_branding', JSON.stringify(branding));
  }, [branding]);

  const updateBranding = (newBranding: Partial<AgencyBranding>) => {
    setBranding((prev) => ({ ...prev, ...newBranding }));
  };

  const resetBranding = () => {
    setBranding(defaultBranding);
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, resetBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);
