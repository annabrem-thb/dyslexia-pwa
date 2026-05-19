import React, { useState } from 'react';

// Standalone intro/language-selection screen.
// All strings are defined inline to ensure the UI can be localized before the main app state loads.

// ─── Localization Dictionary ───────────────────────────────────────────────
const INTRO_STRINGS = {
  pl: {
    title:    'Context Master',
    subtitle: 'Twoja bezstresowa przestrzeń do ćwiczeń. Rozwijaj się i zdobywaj nagrody we własnym tempie!',
    chooseLanguage: 'Wybierz język',
    start:    'Rozpocznij',
    features: [
      { icon: '🌱', text: 'Przyjazne i spokojne środowisko' },
      { icon: '🎮', text: 'Grywalizacja bez presji czasu' },
      { icon: '♿', text: 'Pełna dostępność wizualna' },
    ],
    next: 'Dalej',
    goalTitle: 'Twój cel dzienny',
    goalSubtitle: 'Ustal, ile czasu chcesz poświęcić na rozwój każdego dnia. Zawsze możesz to zmienić w ustawieniach.',
    goal5: '5 min — Szybka powtórka',
    goal10: '10 min — Dobry nawyk',
    goal15: '15 min — Głębokie skupienie',
    goal20: '20 min — Intensywny trening',
  },
  en: {
    title:    'Context Master',
    subtitle: 'Your stress-free space for therapy. Grow and earn rewards at your own pace!',
    chooseLanguage: 'Choose language',
    start:    'Start Journey',
    features: [
      { icon: '🌱', text: 'Calm & friendly environment' },
      { icon: '🎮', text: 'Gamification without time pressure' },
      { icon: '♿', text: 'Full visual accessibility' },
    ],
    next: 'Next',
    goalTitle: 'Your Daily Goal',
    goalSubtitle: 'Set how much time you want to dedicate to growth each day. You can always change it later.',
    goal5: '5 min — Quick review',
    goal10: '10 min — Good habit',
    goal15: '15 min — Deep focus',
    goal20: '20 min — Intensive training',
  },
  de: {
    title:    'Context Master',
    subtitle: 'Dein stressfreier Raum für Übungen. Wachse und sammle Belohnungen in deinem eigenen Tempo!',
    chooseLanguage: 'Sprache wählen',
    start:    'Starten',
    features: [
      { icon: '🌱', text: 'Ruhige & freundliche Umgebung' },
      { icon: '🎮', text: 'Gamifizierung ohne Zeitdruck' },
      { icon: '♿', text: 'Volle visuelle Barrierefreiheit' },
    ],
    next: 'Weiter',
    goalTitle: 'Dein Tagesziel',
    goalSubtitle: 'Lege fest, wie viel Zeit du jeden Tag investieren möchtest. Du kannst es jederzeit ändern.',
    goal5: '5 Min — Kurze Wiederholung',
    goal10: '10 Min — Gute Gewohnheit',
    goal15: '15 Min — Voller Fokus',
    goal20: '20 Min — Intensives Training',
  },
};

const LANGUAGES = [
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'pl', flag: '🇵🇱', label: 'Polski' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
];

// ─── Component ────────────────────────────────────────────────────────────────
function IntroScreen({ language, setLanguage, dailyGoal = 10, setDailyGoal, onStart, noFlash = false, isHighContrast = false, bigTargets = false }) {
  const s = INTRO_STRINGS[language] || INTRO_STRINGS.de;
  const bounceClass = noFlash ? '' : 'animate-bounce';
  const [step, setStep] = useState(1);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 overflow-hidden ${isHighContrast ? 'bg-black' : 'bg-[#fdfaf6]'}`}>
      
      {/* --- BACKGROUND LAYER --- */}
      {/* The background image is visible (opacity-50) but does not interfere with text readability */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${isHighContrast ? 'opacity-0' : 'opacity-10'}`}
        style={{ backgroundImage: "url('/image.png')" }}
      />

      {/* --- MAIN GLASSMORPHISM PANEL --- */}
      {/* This container acts as a protective "glass" card, ensuring high contrast for LRS users */}
      <div className={`relative z-10 flex flex-col items-center w-full max-w-md px-6 py-10 rounded-[2.5rem] shadow-2xl text-center transition-all min-h-[500px] justify-between ${
        isHighContrast 
          ? 'bg-black border-2 border-white' 
          : 'bg-white/90 backdrop-blur-md border border-slate-200'
      }`}>

        {step === 1 ? (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-left duration-500">
            {/* Logo animation */}
            <div className={`text-7xl mb-4 drop-shadow-lg ${bounceClass}`} aria-hidden="true">🧩</div>

            {/* Main App Title */}
            <h1 className={`text-4xl sm:text-5xl font-black mb-3 tracking-tighter drop-shadow-md ${isHighContrast ? 'text-white' : 'text-indigo-700'}`}>
              {s.title}
            </h1>
            
            {/* Motivating Subtitle */}
            <p className={`text-sm font-medium mb-8 max-w-xs leading-relaxed ${isHighContrast ? 'text-white' : 'text-slate-600'}`}>
              {s.subtitle}
            </p>

            {/* Feature Highlights */}
            <div className="flex flex-col gap-2 mb-8 w-full">
              {s.features.map((f, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors ${isHighContrast ? 'bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  <span className="text-xl" aria-hidden="true">{f.icon}</span>
                  <span className={`text-sm font-medium ${isHighContrast ? 'text-white' : 'text-slate-700'}`}>{f.text}</span>
                </div>
              ))}
            </div>

            {/* Language Selection */}
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
              {s.chooseLanguage}
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8 w-full">
              {LANGUAGES.map(({ code, flag, label }) => (
                <button
                  key={code}
                  onClick={() => setLanguage(code)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 transition-all active:scale-95 ${bigTargets ? 'px-6 py-4' : 'px-4 py-3'} ${
                    language === code
                      ? `${isHighContrast ? 'border-white bg-white/20 text-white' : 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-500/10'}`
                      : `${isHighContrast ? 'border-white/30 bg-transparent text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-300'}`
                  }`}
                  aria-pressed={language === code}
                  lang={code}
                >
                  <span className="text-2xl drop-shadow-md" aria-hidden="true">{flag}</span>
                  <span className="text-xs font-black uppercase tracking-wider">{label}</span>
                </button>
              ))}
            </div>

            {/* Call to Action (Next Button) */}
            <button
              onClick={() => setStep(2)}
              className={`w-full sm:w-auto font-black uppercase tracking-wide transition-all active:scale-95 rounded-3xl ${
                bigTargets ? 'px-12 py-5 text-xl' : 'px-12 py-4 text-lg'
              } ${isHighContrast ? 'bg-white text-black hover:bg-slate-200' : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-900/60'}`}
            >
              {s.next}
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center flex-1 animate-in slide-in-from-right duration-500">
            <div className={`text-6xl mb-6 drop-shadow-lg ${bounceClass}`} aria-hidden="true">⏳</div>
            <h2 className={`text-3xl font-black mb-3 tracking-tight drop-shadow-md ${isHighContrast ? 'text-white' : 'text-indigo-700'}`}>
              {s.goalTitle}
            </h2>
            <p className={`text-sm font-medium mb-10 max-w-xs leading-relaxed ${isHighContrast ? 'text-white' : 'text-slate-600'}`}>
              {s.goalSubtitle}
            </p>

            <div className="flex flex-col gap-3 w-full mb-10">
              {[5, 10, 15, 20].map(val => (
                <button
                  key={val}
                  onClick={() => setDailyGoal(val)}
                  className={`p-4 rounded-2xl border-2 transition-all active:scale-95 text-left ${
                    dailyGoal === val
                      ? (isHighContrast ? 'border-white bg-white/20 text-white' : 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md')
                      : (isHighContrast ? 'border-white/30 bg-transparent text-slate-300' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300')
                  }`}
                  aria-pressed={dailyGoal === val}
                >
                  <span className="text-sm font-bold">{s[`goal${val}`]}</span>
                </button>
              ))}
            </div>

            <button
              onClick={onStart}
              className={`w-full sm:w-auto font-black uppercase tracking-wide transition-all active:scale-95 rounded-3xl ${
                bigTargets ? 'px-12 py-5 text-xl' : 'px-12 py-4 text-lg'
              } ${isHighContrast ? 'bg-emerald-400 text-black hover:bg-emerald-300' : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-xl shadow-emerald-900/60'}`}
            >
              {s.start}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default IntroScreen;