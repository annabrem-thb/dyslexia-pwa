/* global describe, it, expect */
import { APP_STRINGS, STRINGS } from '../i18n/strings.js';

/**
 * Helper function to recursively flatten an object's keys into an array of strings.
 * e.g., { a: 1, b: { c: 2 } } -> ['a', 'b.c']
 */
const getFlattenedKeys = (obj, prefix = '') => {
  return Object.keys(obj).reduce((keys, key) => {
    const val = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    // If the value is an object (but not an array or null), recurse deeper
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      return [...keys, ...getFlattenedKeys(val, newKey)];
    }

    // Otherwise, it's a string, function, or primitive (leaf node)
    return [...keys, newKey];
  }, []);
};

describe('Internationalization (i18n) Dictionaries', () => {
  const baseLang = 'pl';
  const targetLangs = ['en', 'de'];

  describe('App.jsx APP_STRINGS', () => {
    const baseKeys = getFlattenedKeys(APP_STRINGS[baseLang]);

    targetLangs.forEach((lang) => {
      it(`should have no missing keys in '${lang}' compared to '${baseLang}'`, () => {
        const targetKeys = getFlattenedKeys(APP_STRINGS[lang]);
        const missingKeys = baseKeys.filter((key) => !targetKeys.includes(key));

        expect(missingKeys).toEqual([]); // Fails and displays exactly which keys are missing
      });
    });
  });

  describe('SettingsModal.jsx STRINGS', () => {
    const baseKeys = getFlattenedKeys(STRINGS[baseLang]);

    targetLangs.forEach((lang) => {
      it(`should have no missing keys in '${lang}' compared to '${baseLang}'`, () => {
        const targetKeys = getFlattenedKeys(STRINGS[lang]);
        const missingKeys = baseKeys.filter((key) => !targetKeys.includes(key));

        expect(missingKeys).toEqual([]); // Fails and displays exactly which keys are missing
      });
    });
  });
});
