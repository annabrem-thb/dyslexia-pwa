// MemorySpanExercise.jsx — a11y-aware with Shared Logic for Voice & Bionic Reading
import React, { useState, useEffect, useMemo } from 'react';
// Importing shared components and hooks to prevent code duplication
import BionicText from '../common/BionicText';
import { useExerciseVoice } from '../../hooks/useExerciseVoice';

/**
 * MemorySpanExercise Component
 * Refactored to use centralized hooks for cleaner code.
 * Focuses on sequence memorization and manual/voice recall.
 */
function MemorySpanExercise({
  data,
  themeStyles,
  onSuccess,
  onError,
  t,
  language = 'en',
  speak,
  noFlash = false,
  bigTargets = false,
  extendedTime = false,
  bionicReading = false,
  zenMode = false,
}) {
  const [isMemorizing, setIsMemorizing] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isChecking, setIsChecking] = useState(false);

  // Centralized voice logic using custom hook
  const { isListening, transcript, startListening } = useExerciseVoice(
    language,
    t,
  );

  // Phase 1 timing: Extended time gives ~5s instead of 3s
  const displayDuration = extendedTime
    ? (data.displayTime || 3000) * 1.67
    : data.displayTime || 3000;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMemorizing(false);
      // Auto-read the items to memorize
      if (data.displayItems) speak(data.displayItems.join(', '), extendedTime);
    }, displayDuration);
    return () => clearTimeout(timer);
  }, [data.displayItems, displayDuration, speak, extendedTime]);

  const stableScrambled = useMemo(
    () => (data.scrambled ? [...data.scrambled] : []),
    [data.scrambled],
  );

  const handleSelectItem = (item) => {
    if (isChecking || isMemorizing) return;
    const newSelected = [...selectedItems, item];
    setSelectedItems(newSelected);

    // Validation logic
    if (newSelected.length === data.correct.length) {
      setIsChecking(true);
      const isCorrect = newSelected.every((val, i) => val === data.correct[i]);
      if (isCorrect) {
        onSuccess();
      } else {
        onError();
        const resetDelay = extendedTime ? 1500 : 800;
        setTimeout(() => {
          setSelectedItems([]);
          setIsChecking(false);
        }, resetDelay);
      }
    }
  };

  // Voice recognition logic for numbers
  const handleVoiceMatch = (num) => {
    const selectedIndex = num - 1;
    if (selectedIndex >= 0 && selectedIndex < stableScrambled.length) {
      const selectedItem = stableScrambled[selectedIndex];
      if (!selectedItems.includes(selectedItem)) {
        handleSelectItem(selectedItem);
      } else {
        onError(); // Item already selected
      }
    } else {
      onError();
    }
  };

  const handleHint = () => speak([...data.correct].reverse().join(', '), true);

  // --- Read Options Aloud Logic ---
  const readAvailableItems = () => {
    const silentPause = ' ... , , , ... ';
    let spokenText = `${data.instruction}${silentPause}`;

    stableScrambled.forEach((item, index) => {
      if (!selectedItems.includes(item)) {
        const optionPrefix =
          {
            pl: `Opcja ${index + 1}: `,
            en: `Option ${index + 1}: `,
            de: `Option ${index + 1}: `,
          }[language] || `Option ${index + 1}: `;
        spokenText += `${optionPrefix} ${item}. `;
      }
    });

    speak(spokenText, extendedTime);
  };

  // Dynamic styling
  const animClass = noFlash ? '' : 'animate-in fade-in zoom-in duration-500';
  const popAnim = noFlash ? '' : 'animate-in pop-in';
  const pulseClass = noFlash ? '' : 'animate-pulse';
  const tileSize = bigTargets ? 'w-24 h-28' : 'w-20 h-24';
  const tileText = bigTargets ? 'text-5xl' : 'text-4xl';
  const letterBtn = bigTargets
    ? 'w-20 h-20 text-2xl rounded-3xl'
    : 'w-16 h-16 text-2xl rounded-2xl';
  const hintPadding = bigTargets ? 'px-8 py-4' : 'px-6 py-3';
  const controlBtnSize = bigTargets
    ? 'w-20 h-20 text-3xl'
    : 'w-16 h-16 text-2xl';

  return (
    <div
      className={`${animClass} flex min-h-96 w-full flex-col items-center justify-between`}
    >
      <div className="w-full text-center">
        <h3 className="mb-6 px-4 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
          {isMemorizing ? t.memorize || 'Zapamiętaj!' : data.instruction}
        </h3>

        {/* Phase 1: memorization */}
        {isMemorizing ? (
          <div
            className={`flex justify-center gap-4 ${pulseClass}`}
            aria-live="polite"
          >
            {data.displayItems?.map((item, i) => (
              <div
                key={i}
                className={`${tileSize} rounded-3xl border-4 bg-white ${themeStyles.border} flex items-center justify-center ${tileText} font-bold shadow-sm`}
              >
                <BionicText text={String(item)} enabled={bionicReading} />
              </div>
            ))}
          </div>
        ) : (
          !zenMode && (
            <div className="mb-8 text-6xl" aria-hidden="true">
              ❓
            </div>
          )
        )}
      </div>

      {/* Phase 2: user input */}
      {!isMemorizing && (
        <div
          className={`flex w-full flex-1 flex-col items-center ${noFlash ? '' : 'animate-in fade-in duration-500'}`}
        >
          {/* Voice Controls */}
          <div className="mb-8 flex gap-6">
            <button
              onClick={readAvailableItems}
              className={`${controlBtnSize} flex items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-slate-400 shadow-sm transition-all hover:text-slate-600 active:scale-90`}
              aria-label={t.readAloud || 'Read available options'}
            >
              🔊
            </button>

            <button
              onClick={() => startListening(handleVoiceMatch)}
              className={`${controlBtnSize} flex items-center justify-center rounded-full shadow-lg transition-all active:scale-95 ${
                isListening
                  ? 'animate-pulse bg-red-500 text-white ring-8 ring-red-100'
                  : `${themeStyles.button} text-white hover:brightness-110`
              }`}
              aria-label={isListening ? t.listening : t.speakOptionNumber}
              aria-pressed={isListening}
            >
              {isListening ? '🛑' : '🎤'}
            </button>
          </div>

          {transcript && (
            <p className="mb-4 text-center text-xs font-black tracking-widest text-slate-400 uppercase">
              {t.heard}: <span className="text-slate-600">{transcript}</span>
            </p>
          )}

          {/* Selected sequence */}
          <div className="mb-6 flex min-h-16 w-full flex-wrap justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-4">
            {selectedItems.map((item, index) => (
              <div
                key={index}
                className={`rounded-xl px-4 py-2 font-bold shadow-sm ${popAnim} ${themeStyles.button} text-white`}
              >
                <BionicText text={String(item)} enabled={bionicReading} />
              </div>
            ))}
          </div>

          {/* Available items Grid */}
          <div className="mb-6 flex w-full max-w-sm flex-wrap justify-center gap-3">
            {stableScrambled.map((item, index) => {
              const isSelected = selectedItems.includes(item);
              return (
                <button
                  key={index}
                  onClick={() => handleSelectItem(item)}
                  disabled={isSelected || isListening}
                  className={`relative ${letterBtn} border-2 font-bold transition-all ${
                    isSelected || isListening
                      ? 'cursor-default border-slate-200 bg-slate-100 text-slate-400 opacity-30'
                      : `bg-white shadow-sm ${themeStyles.border} ${themeStyles.accent} hover:bg-slate-50 active:scale-90`
                  }`}
                  aria-pressed={isSelected}
                >
                  {!isSelected && (
                    <span
                      className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[9px] text-white shadow-sm"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                  )}
                  <BionicText text={String(item)} enabled={bionicReading} />
                </button>
              );
            })}
          </div>

          {/* Hint Button */}
          {!zenMode && (
            <button
              onClick={handleHint}
              className={`flex items-center gap-2 ${hintPadding} rounded-full bg-slate-100 text-xs font-bold tracking-widest text-slate-500 uppercase transition-all hover:bg-slate-200 active:scale-95`}
            >
              💡 {t.hint || 'Hint'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MemorySpanExercise;
