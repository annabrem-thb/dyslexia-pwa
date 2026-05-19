import { useState, useEffect } from 'react';

/**
 * Hook to manage accessibility and app settings with persistence.
 */
export function useSettings() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('app_settings');
    return saved
      ? JSON.parse(saved)
      : {
          bionicReading: false,
          zenMode: false,
          bigTargets: false,
          noFlash: false,
          extendedTime: false,
        };
  });

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return { ...settings, updateSetting };
}
