import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Create the Context
const GamificationContext = createContext();

// 2. Create the Provider Component
export function GamificationProvider({ children }) {
  // Initialize state directly from LocalStorage
  const [isGamified, setIsGamified] = useState(() => {
    return localStorage.getItem('cfg_game') !== 'false';
  });

  // Sync with LocalStorage whenever the state changes
  useEffect(() => {
    localStorage.setItem('cfg_game', String(isGamified));
  }, [isGamified]);

  return (
    <GamificationContext.Provider value={{ isGamified, setIsGamified }}>
      {children}
    </GamificationContext.Provider>
  );
}

// 3. Create a Custom Hook for easy consumption
export function useGamification() {
  return useContext(GamificationContext);
}
