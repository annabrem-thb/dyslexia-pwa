import { createContext, useContext } from 'react';

export const AppConfigContext = createContext({
  theme: 'Natur',
  setTheme: () => {},
  accessibility: 'Standard',
  setAccessibility: () => {},
  language: 'de',
  setLanguage: () => {},
});

export const useConfig = () => useContext(AppConfigContext);
