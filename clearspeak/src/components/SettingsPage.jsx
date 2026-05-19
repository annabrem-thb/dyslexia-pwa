import React from 'react';
import { useConfig } from '../useConfig';
import { useTranslation } from '../i18n/i18n';

export default function SettingsPage({ onBack }) {
  const {
    theme,
    setTheme,
    accessibility,
    setAccessibility,
    language,
    setLanguage,
  } = useConfig();
  const t = useTranslation(language);

  const themeKeys = ['Musik', 'Natur', 'Kunst'];
  const profileKeys = ['Standard', 'LRS', 'Kontrast', 'Motorik'];
  const languages = [
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'pl', label: 'Polski', flag: '🇵🇱' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  return (
    <div className="animate-in slide-in-from-right min-h-screen bg-white p-8 duration-300">
      <button
        onClick={onBack}
        className="mb-8 flex items-center font-bold text-teal-600"
      >
        {t.settingsBack}
      </button>

      <h2 className="mb-8 text-3xl font-black">{t.settingsTitle}</h2>

      <section className="mb-10">
        <h3 className="mb-4 text-sm font-bold tracking-widest text-slate-400 uppercase">
          {t.languageLabel}
        </h3>
        <div className="flex gap-3">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`flex-1 rounded-2xl border-2 py-3 text-sm font-bold transition-all ${
                language === l.code
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-slate-100 text-slate-500'
              }`}
            >
              <span className="mb-1 block text-xl">{l.flag}</span>
              {l.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h3 className="mb-4 text-sm font-bold tracking-widest text-slate-400 uppercase">
          {t.settingsTheme}
        </h3>
        <div className="grid gap-3">
          {themeKeys.map((key) => {
            const themeData = t.themes[key];
            return (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={`rounded-2xl border-2 p-4 text-left transition-all ${
                  theme === key
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 font-bold">
                  <span className="text-2xl">{themeData.icon}</span>{' '}
                  {themeData.name}
                </div>
                <p className="ml-9 text-xs text-slate-500">{themeData.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-10">
        <h3 className="mb-4 text-sm font-bold tracking-widest text-slate-400 uppercase">
          {t.settingsAccessibility}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {profileKeys.map((key) => {
            const profile = t.profiles[key];
            return (
              <button
                key={key}
                onClick={() => setAccessibility(key)}
                className={`rounded-2xl border-2 p-4 text-left text-xs font-bold transition-all ${
                  accessibility === key
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-slate-100 text-slate-600'
                }`}
              >
                <span className="mb-1 block font-black">{profile.name}</span>
                <span className="text-[10px] font-medium opacity-70">
                  {profile.desc}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="rounded-3xl bg-slate-50 p-6 text-center">
        <p className="text-xs text-slate-400">{t.settingsFooter}</p>
      </div>
    </div>
  );
}
