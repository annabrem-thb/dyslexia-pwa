/* 
 * App.jsx (Version 4)
 * Main application component responsible for state management, theming, and exercise rendering.
 */

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';

import { wordDatabaseDE } from '../data/vocabulary_de.js';
import { wordDatabaseEN } from '../data/vocabulary_en.js';
import { wordDatabasePL } from '../data/vocabulary_pl.js';
import { useTranslation }  from '../i18n/i18n.js';
import { APP_STRINGS } from '../i18n/strings.js';

import IntroScreen        from './Introscreen.jsx';
import SettingsModal      from './SettingsModal.jsx';
import ProgressPill       from './ProgressPill.jsx';
import VirtualGarden      from './VirtualGarden.jsx';
import BionicText         from './common/BionicText.jsx';
import AccessibleTTS      from './common/AccessibleTTS.jsx';
import TTSController      from './common/TTSController.jsx';
import SkeletonLoader     from './common/SkeletonLoader.jsx';

import { ExerciseRenderer } from './ExerciseRenderer.jsx';
import { GamificationProvider, useGamification } from './GamificationContext.jsx';

// --- Global Constants & Configurations ---
const POINTS_PER_LEVEL = 5;
const PILLARS = ['Spelling', 'Structure', 'Spatial', 'Memory'];
const DATABASES = { de: wordDatabaseDE, pl: wordDatabasePL, en: wordDatabaseEN };

const PILLAR_LABELS = {
  pl: { Spelling: 'Słowa',    Structure: 'Zdania',    Spatial: 'Kierunki',   Memory: 'Pamięć'     },
  en: { Spelling: 'Words',    Structure: 'Sentences', Spatial: 'Directions', Memory: 'Memory'     },
  de: { Spelling: 'Wörter',   Structure: 'Sätze',     Spatial: 'Richtungen', Memory: 'Gedächtnis' },
};
const PILLAR_ICONS = { Spelling: '📖', Structure: '🧩', Spatial: '🧭', Memory: '🧠' };

const THEMES = {
  Natur: { accent: 'text-emerald-600', bg: 'bg-emerald-50', button: 'bg-emerald-500', buttonText: 'text-white',     border: 'border-emerald-200', hex: '#10b981', price: 0  },
  Musik: { accent: 'text-purple-600',  bg: 'bg-purple-50',  button: 'bg-purple-500',  buttonText: 'text-white',     border: 'border-purple-200',  hex: '#8b5cf6', price: 3  },
  Kunst: { accent: 'text-amber-600',   bg: 'bg-amber-50',   button: 'bg-amber-500',   buttonText: 'text-amber-950', border: 'border-amber-200',   hex: '#f59e0b', price: 5  },
  Space: { accent: 'text-indigo-600',  bg: 'bg-indigo-50',  button: 'bg-indigo-500',  buttonText: 'text-white',     border: 'border-indigo-200',  hex: '#6366f1', price: 8  },
  Ocean: { accent: 'text-cyan-600',    bg: 'bg-cyan-50',    button: 'bg-cyan-500',    buttonText: 'text-cyan-950',  border: 'border-cyan-200',    hex: '#06b6d4', price: 10 },
};

// --- Helper Functions ---
const seededShuffle = (array, seed) => {
  let m = array.length, t, i;
  const rand = (s) => { const x = Math.sin(s) * 10000; return x - Math.floor(x); };
  while (m) {
    i = Math.floor(rand(seed + m) * m--);
    t = array[m]; array[m] = array[i]; array[i] = t;
  }
  return array;
};

// Function synthesizing unique sounds for themes using Web Audio API
const playThemeSound = (theme) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    const playTone = (freq, type, startTime, duration, vol) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + duration * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    switch(theme) {
      case 'Ocean': // Bubble sound
        playTone(400, 'sine', now, 0.15, 0.2);
        playTone(600, 'sine', now + 0.1, 0.15, 0.2);
        playTone(800, 'sine', now + 0.2, 0.15, 0.2);
        break;
      case 'Space': // Retro-space sound (Theremin)
        playTone(440, 'sine', now, 0.4, 0.15);
        playTone(880, 'sine', now + 0.1, 0.3, 0.15);
        break;
      case 'Musik': // Harp/bell arpeggio
        playTone(523.25, 'triangle', now, 0.3, 0.15);
        playTone(659.25, 'triangle', now + 0.1, 0.3, 0.15);
        playTone(783.99, 'triangle', now + 0.2, 0.4, 0.15);
        playTone(1046.50, 'triangle', now + 0.3, 0.6, 0.15);
        break;
      case 'Kunst': // Inspiring chord
        playTone(329.63, 'sine', now, 0.5, 0.15); // E4
        playTone(415.30, 'sine', now, 0.5, 0.15); // G#4
        playTone(523.25, 'sine', now, 0.5, 0.15); // C5
        break;
      case 'Natur':
      default: // Gentle wooden marimba / chirp
        playTone(700, 'sine', now, 0.2, 0.2);
        playTone(900, 'sine', now + 0.1, 0.3, 0.2);
        break;
    }
  } catch (e) {
    console.warn("Web Audio API not supported", e);
  }
};

const makeDailyQuests = () => [
  { id: 1, type: 'Spelling',  target: 3,  current: 0, completed: false, reward: 3 },
  { id: 2, type: 'Structure', target: 2,  current: 0, completed: false, reward: 3 },
  { id: 3, type: 'Any',       target: 10, current: 0, completed: false, reward: 5 },
];

// --- Main App Component ---
function AppContent() {
  const [language,         setLanguage]         = useState(() => localStorage.getItem('cfg_lang')  || 'de');
  const [theme,            setTheme]            = useState(() => localStorage.getItem('cfg_theme') || 'Natur');
  const [a11yAddons,       setA11yAddons]       = useState(() => {
    const sv = localStorage.getItem('cfg_addons'); return sv ? JSON.parse(sv) : [];
  });
  const { isGamified } = useGamification();
  const [inclusiveOptions, setInclusiveOptions] = useState(() => {
    const sv = localStorage.getItem('cfg_inclusive');
    return sv ? JSON.parse(sv) : { adaptiveDifficulty: false, bigTargets: false, noFlash: false, audioRewards: false, extendedTime: false, zenMode: false, bionicReading: false };
  });
  const [dailyGoal, setDailyGoal] = useState(() => Number(localStorage.getItem('cfg_goal')) || 10);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(() => localStorage.getItem('cfg_voice_uri') || 'default');
  const [voiceSpeed, setVoiceSpeed] = useState(() => Number(localStorage.getItem('cfg_voice_speed')) || 0.85);

  const [activeTab,    setActiveTab]    = useState(() => isGamified ? 'Garden' : 'Spelling');
  const [lastPillar,   setLastPillar]   = useState('Spelling'); // Remembers the pillar for garden rendering
  const [showIntro,    setShowIntro]    = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showSuccess,  setShowSuccess]  = useState(false);
  const [earnedCoinsAnim, setEarnedCoinsAnim] = useState(null);

  const [currentIndex,  setCurrentIndex]  = useState(() => Number(localStorage.getItem('idx')) || 0);
  const [points,        setPoints]        = useState(() => Number(localStorage.getItem('pts')) || 0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [feedback,      setFeedback]      = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [rewards,       setRewards]       = useState(() => JSON.parse(localStorage.getItem('rew') || '[]'));

  const [coins,          setCoins]          = useState(() => Number(localStorage.getItem('cfg_coins')) || 0);
  const [unlockedThemes, setUnlockedThemes] = useState(() => {
    const sv = localStorage.getItem('cfg_unlocked_themes'); return sv ? JSON.parse(sv) : ['Natur'];
  });
  const [dailyQuests, setDailyQuests] = useState(() => {
    const saved = localStorage.getItem('cfg_quests');
    const today = new Date().toDateString();
    const data  = saved ? JSON.parse(saved) : null;
    return (data && data.date === today) ? data : { date: today, tasks: makeDailyQuests() };
  });

  useEffect(() => {
    if (!isGamified && activeTab === 'Garden') {
      setActiveTab('Spelling');
    }
  }, [isGamified, activeTab]);

  // Wyświetlanie Skeleton Loadera przez 300ms za każdym razem, 
  // gdy użytkownik przechodzi do następnego zadania, zmienia zakładkę lub motyw.
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [currentIndex, activeTab, theme]);

  const t_hook      = useTranslation(language);
  // Fallback mechanism: use German as default for any missing translated strings
  const s           = useMemo(() => ({ ...APP_STRINGS.de, ...(APP_STRINGS[language] || {}) }), [language]);
  const t           = useMemo(() => ({ ...t_hook, ...s }), [t_hook, s]);
  const db          = DATABASES[language]   || DATABASES.de;
  const themeStyles = THEMES[theme]         || THEMES.Natur;
  const noFlash        = !!(inclusiveOptions.noFlash    || a11yAddons.includes('Redukcja'));
  const bigTargets     = !!(inclusiveOptions.bigTargets || a11yAddons.includes('Motorik'));
  const hideNavLabel   = a11yAddons.includes('Niedowidzenie');
  const isHighContrast = a11yAddons.includes('Kontrast');
  const hasRuler       = a11yAddons.includes('Linijka');

  const cardRef = useRef(null);
  const [rulerPos, setRulerPos] = useState({ y: 0, visible: false });

  useEffect(() => {
    if (!hasRuler) return;
    
    const updateRuler = (clientX, clientY) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        // Check if the cursor is within the bounds of the exercise card
        if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
          setRulerPos({ y: clientY - rect.top, visible: true }); // y calculated relative to the top of the card
        } else {
          setRulerPos(prev => prev.visible ? { ...prev, visible: false } : prev);
        }
      }
    };

    const handleMouseMove = (e) => updateRuler(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        updateRuler(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
    };
  }, [hasRuler]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-a11y-contrast', String(isHighContrast));
    root.setAttribute('data-a11y-motor',    String(bigTargets));
    root.setAttribute('data-a11y-vision',   String(a11yAddons.includes('Niedowidzenie')));
    root.setAttribute('data-a11y-color',    String(a11yAddons.includes('Daltonizm')));
    root.setAttribute('data-a11y-motion',   String(noFlash));
    root.style.setProperty('--theme-accent', THEMES[theme]?.hex || '#10b981');
    root.lang = language;
  }, [a11yAddons, inclusiveOptions, theme, isHighContrast, bigTargets, noFlash, language]);

  useEffect(() => {
    localStorage.setItem('cfg_lang',            language);
    localStorage.setItem('cfg_theme',           theme);
    localStorage.setItem('cfg_addons',          JSON.stringify(a11yAddons));
    localStorage.setItem('cfg_inclusive',       JSON.stringify(inclusiveOptions));
    localStorage.setItem('pts',                 String(points));
    localStorage.setItem('idx',                 String(currentIndex));
    localStorage.setItem('rew',                 JSON.stringify(rewards));
    localStorage.setItem('cfg_coins',           String(coins));
    localStorage.setItem('cfg_unlocked_themes', JSON.stringify(unlockedThemes));
    localStorage.setItem('cfg_quests',          JSON.stringify(dailyQuests))
    localStorage.setItem('cfg_voice_uri',       selectedVoiceURI);
    localStorage.setItem('cfg_voice_speed',     String(voiceSpeed));
    localStorage.setItem('cfg_goal',            String(dailyGoal));
  }, [language, theme, a11yAddons, inclusiveOptions, points, currentIndex, rewards, coins, unlockedThemes, dailyQuests, selectedVoiceURI, voiceSpeed, dailyGoal]);

  const speak = useCallback((text, slow = false) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const msg  = new SpeechSynthesisUtterance(text);
    msg.lang   = { de: 'de-DE', pl: 'pl-PL', en: 'en-US' }[language];
    msg.rate   = (slow || inclusiveOptions.extendedTime) ? voiceSpeed * 0.65 : voiceSpeed;

    const allVoices = window.speechSynthesis.getVoices();
    let selectedVoice = null;

    if (selectedVoiceURI && selectedVoiceURI !== 'default') {
      selectedVoice = allVoices.find(v => v.voiceURI === selectedVoiceURI);
    } else {
      if (language === 'pl')      selectedVoice = allVoices.find(v => v.name.includes('Zofia'));
      else if (language === 'en') selectedVoice = allVoices.find(v => v.name.includes('Emma'));
      else if (language === 'de') selectedVoice = allVoices.find(v => v.name.includes('Amala'));
    }

    if (selectedVoice) {
      msg.voice = selectedVoice;
    }
    window.speechSynthesis.speak(msg);
  }, [language, inclusiveOptions.extendedTime, selectedVoiceURI, voiceSpeed]);

  const activePillarTasks = useMemo(() => {
    if (activeTab === 'Garden') return [];
    let tasks = [];
    switch (activeTab) {
      case 'Spelling':  tasks = [...(db.graphemes || []), ...(db.context || [])]; break;
      case 'Structure': tasks = [...(db.phonemes || []), ...(db.syllables || []), ...(db.scrabble || [])]; break;
      case 'Spatial':   tasks = [...(db.clock || []), ...(db.tracking || [])]; break;
      case 'Memory':    tasks = [...(db.sequences || [])]; break;
      default:          tasks = [];
    }
    const seed = activeTab.split('').reduce((a, b) => a + b.charCodeAt(0), 0) + (language === 'pl' ? 1 : 2);
    return seededShuffle([...tasks], seed);
  }, [activeTab, db, language]);

  const currentTask = activePillarTasks[currentIndex] || null;

  const updateQuests = useCallback((pillarType) => {
    setDailyQuests(prev => {
      const newTasks = prev.tasks.map(task => {
        if (task.completed) return task;
        if (task.type === pillarType || task.type === 'Any') {
          const newCurrent = task.current + 1;
          const done = newCurrent >= task.target;
          if (done) setCoins(c => c + task.reward);
          return { ...task, current: newCurrent, completed: done };
        }
        return task;
      });
      return { ...prev, tasks: newTasks };
    });
  }, []);

  const goNext = useCallback(() => {
    setFeedback(null);
    setCurrentIndex(prev => (prev + 1) % (activePillarTasks.length || 1));
  }, [activePillarTasks]);

  const goPrev = useCallback(() => {
    setFeedback(null);
    setCurrentIndex(prev => (prev - 1 + activePillarTasks.length) % (activePillarTasks.length || 1));
  }, [activePillarTasks]);

  const handleSuccess = useCallback(() => {
    const newStreak = currentStreak + 1;
    setCurrentStreak(newStreak);

    // Play thematic success sound (if audio rewards are enabled)
    if (inclusiveOptions.audioRewards) {
      playThemeSound(theme);
    }

    let earnedCoins = 1;
    if (isGamified) {
      dailyQuests.tasks.forEach(task => {
        if (!task.completed && (task.type === activeTab || task.type === 'Any')) {
          if (task.current + 1 >= task.target) {
            earnedCoins += task.reward;
          }
        }
      });
    }

    updateQuests(activeTab);

    const baseSuccessMsg = Array.isArray(t.successMsg) 
      ? t.successMsg[Math.floor(Math.random() * t.successMsg.length)] 
      : t.successMsg;
      
    let msg = baseSuccessMsg;
    if (newStreak >= 3 && t.streakMsg) {
      msg = Array.isArray(t.streakMsg) 
        ? t.streakMsg[Math.floor(Math.random() * t.streakMsg.length)].replace(/{count}/g, newStreak)
        : (typeof t.streakMsg === 'function' ? t.streakMsg(newStreak) : t.streakMsg);
    }
    setFeedback({ type: 'success', msg });

    let voiceSuccessMsg = Array.isArray(t.voice?.success)
      ? t.voice.success[Math.floor(Math.random() * t.voice.success.length)]
      : (t.voice?.success || '');
      
    if (newStreak >= 3 && t.voice?.streak) {
      voiceSuccessMsg = Array.isArray(t.voice.streak)
        ? t.voice.streak[Math.floor(Math.random() * t.voice.streak.length)].replace(/{count}/g, newStreak)
        : t.voice.streak;
    }
    speak(voiceSuccessMsg);

    if (isGamified) {
      const newPoints = points + 1;
      setPoints(newPoints);
      setCoins(prev => prev + 1);

      setEarnedCoinsAnim(earnedCoins);
      setTimeout(() => setEarnedCoinsAnim(null), 1500);

      const pool = t.rewardItems?.[theme] || t.rewardItems?.Natur || ['⭐'];
      setRewards(prev => [...prev, pool[Math.floor(Math.random() * pool.length)]]);
      if (newPoints % POINTS_PER_LEVEL === 0) setTimeout(() => setShowSuccess(true), 1000);
    }
  }, [
    currentStreak, isGamified, dailyQuests, activeTab, updateQuests, t, speak,
    points, theme, setRewards, showSuccess, inclusiveOptions.audioRewards
  ]);

  const handleError = useCallback(() => {
    setCurrentStreak(0);
    
    const errorMsg = Array.isArray(t.voice?.error) 
      ? t.voice.error[Math.floor(Math.random() * t.voice.error.length)] 
      : (t.voice?.error || '✗');
      
    setFeedback({ type: 'error', msg: errorMsg });
    speak(errorMsg);
  }, [t, speak]);

  // --- Swipe-to-navigate logic ---
  const touchStart = useRef(null);
  const touchEnd = useRef(null);

  const onTouchStart = (e) => {
    touchEnd.current = null;
    touchStart.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };
  const onTouchMove = (e) => { touchEnd.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY }; };
  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distanceX = touchStart.current.x - touchEnd.current.x;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(touchStart.current.y - touchEnd.current.y);
    
    if (isHorizontalSwipe && distanceX > 50) goNext();       // Swipe left -> Next task
    if (isHorizontalSwipe && distanceX < -50) goPrev();      // Swipe right -> Prev task
  };

  const renderCurrentExercise = () => {
    if (isTransitioning) {
      return <SkeletonLoader isHighContrast={isHighContrast} />;
    }

    const commonProps = {
      themeStyles, speak, t, language,
      onSuccess: handleSuccess,
      onError: handleError,
      bigTargets,
      extendedTime: !!inclusiveOptions.extendedTime,
      noFlash,
      bionicReading: !!inclusiveOptions.bionicReading,
      zenMode:       !!inclusiveOptions.zenMode,
    };
    return <ExerciseRenderer
      key={`${activeTab}-${currentIndex}`}
      currentTask={currentTask}
      {...commonProps} />;
  };

  // --- Render Intro Screen ---
  if (showIntro) {
    return <IntroScreen 
      language={language} 
      setLanguage={setLanguage} 
      dailyGoal={dailyGoal}
      setDailyGoal={setDailyGoal}
      onStart={() => setShowIntro(false)} 
      noFlash={noFlash}
      isHighContrast={isHighContrast}
      bigTargets={bigTargets}
    />;
  }

  // --- Render Main Application Layout ---
  return (
    <div className={`flex h-dvh w-full overflow-hidden ${isHighContrast ? 'bg-black text-white' : 'bg-[#fdfaf6] text-slate-800'}`}>

      <SettingsModal
        open={settingsOpen}              onClose={() => setSettingsOpen(false)}
        language={language}              setLanguage={setLanguage}
        theme={theme}                    setTheme={setTheme}
        dailyGoal={dailyGoal}            setDailyGoal={setDailyGoal}
        a11yAddons={a11yAddons}          setA11yAddons={setA11yAddons}
        coins={coins}                    setCoins={setCoins}
        unlockedThemes={unlockedThemes}  setUnlockedThemes={setUnlockedThemes}
        inclusiveOptions={inclusiveOptions} setInclusiveOptions={setInclusiveOptions}
        selectedVoiceURI={selectedVoiceURI} setSelectedVoiceURI={setSelectedVoiceURI}
        voiceSpeed={voiceSpeed}          setVoiceSpeed={setVoiceSpeed}
      />

      {/* Navigation Sidebar */}
      <aside className={`w-16 md:w-60 flex flex-col shrink-0 z-40 ${isHighContrast ? 'bg-black border-r border-white/20 shadow-sm' : `bg-[#fdfaf6] border-r ${themeStyles.border} shadow-xl shadow-slate-200/50`}`}>
        <div className={`p-3 md:p-5 flex items-center gap-2 h-16 ${isHighContrast ? 'border-b border-white/20' : `border-b ${themeStyles.border}`}`}>
          <span className="text-2xl" aria-hidden="true">🌉</span>
          <AccessibleTTS text={s.appTitle} speak={speak} className="hidden md:flex">
            <h1 className={`font-black text-base tracking-tighter ${isHighContrast ? 'text-white' : 'text-slate-800'}`}>{s.appTitle}</h1>
          </AccessibleTTS>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 md:px-3 flex flex-col gap-1.5" aria-label={s.navAria}>
          {PILLARS.map(p => {
            const isSelected     = activeTab === p;
            const questForPillar = dailyQuests.tasks.find(q => q.type === p);
            const label          = t.pillars?.[p] || PILLAR_LABELS[language]?.[p] || p;
            return (
              <button key={p}
                onClick={() => { setActiveTab(p); setLastPillar(p); setCurrentIndex(0); setFeedback(null); setCurrentStreak(0); }}
                className={`relative flex items-center justify-center md:justify-start gap-3 p-2.5 md:p-3 rounded-2xl transition-all ${isSelected ? (isHighContrast ? 'bg-white text-black font-bold' : `${themeStyles.bg} ${themeStyles.accent} font-bold shadow-sm`) : (isHighContrast ? 'text-white hover:bg-white/10' : 'text-slate-500 hover:bg-slate-50')}`}
                aria-pressed={isSelected}
                aria-label={label}
              >
                <span className={hideNavLabel ? 'text-2xl' : 'text-xl'} aria-hidden="true">{PILLAR_ICONS[p]}</span>
                {!hideNavLabel && (
                  <AccessibleTTS text={label} speak={speak} className="hidden md:flex">
                    <span className="text-xs font-bold uppercase tracking-wider truncate">{label}</span>
                  </AccessibleTTS>
                )}
                {questForPillar && !questForPillar.completed && questForPillar.current > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true" />
                )}
              </button>
            );
          })}
          <div className={`my-2 border-t ${isHighContrast ? 'border-white/20' : themeStyles.border}`} />
          {isGamified && (
            <button
              onClick={() => { setActiveTab('Garden'); setFeedback(null); }}
              className={`relative flex items-center justify-center md:justify-start gap-3 p-2.5 md:p-3 rounded-2xl transition-all ${activeTab === 'Garden' ? (isHighContrast ? 'bg-white text-black font-bold' : `${themeStyles.bg} ${themeStyles.accent} font-bold shadow-sm`) : (isHighContrast ? 'text-white hover:bg-white/10' : 'text-slate-500 hover:bg-slate-50')}`}
              aria-pressed={activeTab === 'Garden'}
              aria-label={t.garden || "Garten"}
            >
              <span className={hideNavLabel ? 'text-2xl' : 'text-xl'} aria-hidden="true">
                {t?.levelIcons?.[theme]?.[0] || '🌱'}
              </span>
              {!hideNavLabel && (
                <AccessibleTTS text={t.garden || "Garten"} speak={speak} className="hidden md:flex">
                  <span className="text-xs font-bold uppercase tracking-wider truncate">{t.garden || "Garten"}</span>
                </AccessibleTTS>
              )}
            </button>
          )}
          <button
            onClick={() => setSettingsOpen(true)}
            className={`flex items-center justify-center md:justify-start gap-3 p-2.5 md:p-3 rounded-2xl transition-all ${isHighContrast ? 'text-white hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}
            aria-label={s.settingsAria}
          >
            <span className={hideNavLabel ? 'text-2xl' : 'text-xl'} aria-hidden="true">⚙️</span>
            {!hideNavLabel && (
              <AccessibleTTS text={s.settingsAria} speak={speak} className="hidden md:flex">
                <span className="text-xs font-bold uppercase tracking-wider">{s.settingsAria}</span>
              </AccessibleTTS>
            )}
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-dvh overflow-hidden">
        <main 
          className={`flex-1 flex flex-col min-h-0 overflow-y-auto px-3 md:px-6 py-4 mx-auto w-full max-w-xl ${isHighContrast ? 'text-white' : 'text-slate-800'}`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {activeTab === 'Garden' ? (
            <div className="flex-1 w-full h-full py-2 animate-in fade-in zoom-in duration-500">
              <VirtualGarden 
                points={points} 
                streak={currentStreak} 
                dailyQuests={dailyQuests} 
                isHighContrast={isHighContrast} 
                theme={theme} 
                themeStyles={themeStyles} 
                t={t} 
                activeCategory={lastPillar} 
                isFullScreen={true} 
              />
            </div>
          ) : (
            <>
              {/* Minimal Progress Row without numeric noise */}
              <div className={`rounded-3xl px-4 py-3 mb-4 flex items-center justify-between gap-4 relative shrink-0 ${isHighContrast ? 'bg-black border border-white/30 shadow-sm' : `bg-white border ${themeStyles.border} shadow-md shadow-slate-200/50`}`}>
                {rewards.length > 0 && isGamified && !inclusiveOptions.zenMode && (
          <div className={`absolute -top-4 left-4 px-3 py-1 rounded-full font-black text-xs uppercase tracking-widest shadow-lg border-2 z-20 flex items-center gap-1.5 ${isHighContrast ? 'bg-black border-white text-white' : `bg-white ${themeStyles.border} text-slate-500`} ${noFlash ? '' : 'animate-in zoom-in duration-300'}`}>
                    <span>{t.collectedLabel || s.collectedLabel}:</span>
                    <span className="text-xs">{rewards[rewards.length - 1]}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {isGamified && !inclusiveOptions.zenMode ? (
                    <VirtualGarden points={points} streak={currentStreak} dailyQuests={dailyQuests} isHighContrast={isHighContrast} theme={theme} themeStyles={themeStyles} t={t} activeCategory={lastPillar} isFullScreen={false} />
                  ) : (
                    <>
                      <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-black ${isHighContrast ? 'bg-white text-black' : `${themeStyles.button} ${themeStyles.buttonText}`}`}>
                        {Math.floor(points / POINTS_PER_LEVEL) + 1}
                      </div>
                      <ProgressPill points={points % POINTS_PER_LEVEL} max={POINTS_PER_LEVEL} theme={theme} isGamified={isGamified} t={t} isHighContrast={isHighContrast} />
                    </>
                  )}
                </div>
        <div className={`text-xs font-black uppercase tracking-widest shrink-0 ${isHighContrast ? 'text-white/70' : 'text-slate-400'}`}>
                  {!isGamified && `${currentIndex + 1} / ${activePillarTasks.length}`}
                </div>
              </div>

              {/* Active Exercise Card */}
              <section 
                ref={cardRef}
                className={`rounded-4xl flex flex-col items-center relative flex-1 min-h-0 overflow-y-auto px-4 py-6 ${isHighContrast ? 'bg-black border border-white/30 shadow-lg shadow-white/10' : `bg-white border ${themeStyles.border} shadow-2xl shadow-slate-200/50`}`}
                aria-label={s.exerciseAria}
              >
                {/* Reading Ruler Overlay (Restricted to Card) */}
                {hasRuler && rulerPos.visible && (
                  <div 
                    className={`absolute left-0 right-0 h-16 pointer-events-none z-[100] transition-transform duration-75 ${isHighContrast ? 'bg-white/10 border-y border-white/30' : 'bg-indigo-500/10 border-y border-indigo-500/20 backdrop-invert-[0.02]'}`}
                    style={{ top: rulerPos.y - 32 }}
                    aria-hidden="true"
                  />
                )}
                {feedback && (
                  <div className={`absolute top-4 z-20 ${noFlash ? '' : 'animate-in slide-in-from-top duration-300'}`}>
                    <span className={`px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                          role="status" aria-live="polite">
                      <BionicText text={feedback.msg} enabled={!!inclusiveOptions.bionicReading} />
                    </span>
                  </div>
                )}
                <div className="w-full h-full flex flex-col items-center justify-center flex-1 min-h-0">
                  {renderCurrentExercise()}
                </div>
              </section>

              {feedback?.type === 'success' ? (
                <div className="mt-4 flex justify-center animate-in zoom-in duration-300 shrink-0 pb-2">
                  <button onClick={goNext}
                    className={`px-12 py-4 bg-emerald-500 text-white rounded-full font-black uppercase text-sm tracking-widest shadow-xl hover:bg-emerald-400 active:scale-95 transition-all ${noFlash ? '' : 'animate-bounce'} break-words`}>
                    {t.next || s.next || 'Dalej'}
                  </button>
                </div>
              ) : (
                !inclusiveOptions.zenMode && (
                  <div className="mt-3 flex justify-center shrink-0 pb-2">
                    <button onClick={goNext}
                      className={`px-8 py-3 md:py-2 bg-transparent border-2 rounded-full font-black uppercase text-xs tracking-widest transition-colors ${isHighContrast ? 'border-white/50 text-white/80 hover:bg-white/10' : 'border-slate-200 text-slate-400 hover:bg-slate-100'} break-words`}>
                      {t.skip || s.skip}
                    </button>
                  </div>
                )
              )}
            </>
          )}
        </main>
      </div>

      {/* Level-Up Success Overlay */}
      {showSuccess && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-6 text-center ${isHighContrast ? 'bg-black/80 backdrop-blur-sm' : themeStyles.button}`}>
          <div className={`rounded-4xl p-10 shadow-2xl max-w-sm w-full ${noFlash ? '' : 'animate-in zoom-in duration-300'} ${isHighContrast ? 'bg-black border-2 border-white' : 'bg-white'}`}>
            <div className="text-6xl mb-3" aria-hidden="true">🏆</div>
            <h2 className="text-3xl font-black mb-2">{t.levelUp || s.levelUp}</h2>
            <div className="flex justify-center gap-3 text-4xl flex-wrap my-6 bg-slate-50 p-5 rounded-3xl">
              {rewards.slice(-5).map((r, i) => <span key={i}>{r}</span>)}
            </div>
            <button onClick={() => { setShowSuccess(false); goNext(); }}
              className={`w-full py-5 rounded-3xl font-black text-xl shadow-lg active:scale-95 transition-all ${isHighContrast ? 'bg-white text-black' : `${themeStyles.button} ${themeStyles.buttonText}`}`}>
              {t.next || s.next}
            </button>
          </div>
        </div>
      )}

      {/* Floating Global TTS Controls */}
      <TTSController
        voiceSpeed={voiceSpeed} setVoiceSpeed={setVoiceSpeed}
        selectedVoiceURI={selectedVoiceURI} setSelectedVoiceURI={setSelectedVoiceURI}
        language={language} isHighContrast={isHighContrast} themeStyles={themeStyles} t={t}
      />
    </div>
  );
}

export default function App() {
  return (
    <GamificationProvider>
      <AppContent />
    </GamificationProvider>
  );
}