// AppConfigContext.jsx
// Provides the AppConfigContext value to the component tree.
// App.jsx manages its own config state for performance — this provider
// exists for any future child components that want context access.

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
      {children}
    </AppConfigContext.Provider>
  );
}
