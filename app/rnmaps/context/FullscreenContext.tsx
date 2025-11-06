import React, { createContext, useContext, useState, ReactNode } from 'react';

type FullscreenContextType = {
  isFullscreen: boolean;
  setIsFullscreen: (value: boolean) => void;
};

export const FullscreenContext = createContext<FullscreenContextType>({
  isFullscreen: false,
  setIsFullscreen: () => {}
});

export const FullscreenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <FullscreenContext.Provider value={{ isFullscreen, setIsFullscreen }}>
      {children}
    </FullscreenContext.Provider>
  );
};

export const useFullscreen = (): FullscreenContextType => {
  return useContext(FullscreenContext);
};
