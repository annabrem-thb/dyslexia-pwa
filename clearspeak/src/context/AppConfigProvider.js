import React, { useState } from 'react';
import { AppConfigContext } from './AppConfig';

export function AppConfigProvider({ children }) {
  const [theme, setTheme] = useState('Natur');
  const [accessibility, setAccessibility] = useState('Standard');
  const [language, setLanguage] = useState('de');

  return (
    <AppConfigContext.Provider
      value={{
        theme,
        setTheme,
        accessibility,
        setAccessibility,
        language,
        setLanguage,
      }}
    >
      <div
        className={`app-container theme-${theme.toLowerCase()} profile-${accessibility.toLowerCase()}`}
      >
        {children}
      </div>
    </AppConfigContext.Provider>
  );
}
