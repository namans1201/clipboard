'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CompactContextType {
  compact: boolean;
  setCompact: (v: boolean) => void;
}

const CompactContext = createContext<CompactContextType>({
  compact: false,
  setCompact: () => {},
});

export function CompactProvider({ children }: { children: ReactNode }) {
  const [compact, setCompact] = useState(false);
  return (
    <CompactContext.Provider value={{ compact, setCompact }}>
      {children}
    </CompactContext.Provider>
  );
}

export const useCompact = () => useContext(CompactContext);
