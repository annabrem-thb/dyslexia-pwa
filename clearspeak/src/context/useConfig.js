import { useContext } from 'react';
import { AppConfigContext } from './AppConfig'; // Import from the new .js file

export const useConfig = () => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within an AppConfigProvider');
  }
  return context;
};
