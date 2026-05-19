// PhonemeExercise.jsx — a11y-aware with Shared Logic for Voice, Bionic Reading & Auto-Spelling
import React from 'react';
// Importing shared components and hooks to prevent code duplication
import BionicText from '../common/BionicText';
import { useExerciseVoice } from '../../hooks/useExerciseVoice';

/**
 * PhonemeExercise Component
 * Refactored to use centralized utilities.
 * Focuses on pronunciation and letter-to-sound recognition.
 */
function PhonemeExercise({
  data,
  themeStyles,
  onSuccess,
  onError,
  language,
  t,
  speak,
  noFlash = false,
  bigTargets = false,
  extendedTime = false,
  bionicReading = false,
  zenMode = false,
}) {
  // Centralized voice logic using custom hook
  const { isListening, transcript, startListening } = useExerciseVoice(
    language,
    t,
  );

  const targetWord = data.word || '';
  const hintText = data.hints?.[language] || data.hints?.en || '';

  /**
   * Custom Voice Logic for Pronunciation
   * Unlike other exercises that look for numbers, this one checks the word itself.
   */
  const handleVoiceInput = (heardText) => {
    const cleanTarget = targetWord
      .toLowerCase()
      .trim()
      .replace(/[.,!?]/g, '');
    const cleanHeard = heardText
      .toLowerCase()
      .trim()
      .replace(/[.,!?]/g, '');

    // Check if the user pronounced the word correctly
    if (cleanHeard === cleanTarget || cleanHeard.includes(cleanTarget)) {
      onSuccess();
    } else {
      onError();
    }
  };

  // --- Read Word (Spelled Out) & Hint Aloud ---
  const readWordAndHint = () => {
    const silentPause = ' ... , , , ... ';

    // Force the TTS engine to spell the word by inserting periods
    const spelledWord = Array.from(targetWord).join(' . ');
    const spokenText = `${spelledWord}${silentPause}${hintText}`;
    speak(spokenText, extendedTime);
  };

  // Styling and Sizing logic
  const animClass = noFlash ? '' : 'animate-in zoom-in duration-500';
  const pulseClass = noFlash
    ? 'bg-red-500'
    : 'bg-red-500 animate-pulse ring-8 ring-red-100';
  const controlBtnSize = bigTargets
    ? 'w-24 h-24 text-4xl'
    : 'w-20 h-20 text-3xl';
  const wordSize = bigTargets ? 'text-6xl sm:text-7xl' : 'text-5xl sm:text-6xl';

  return (
    <div className={`${animClass} flex w-full max-w-md flex-col items-center`}>
      {/* 1. Header (Hidden in Zen Mode) */}
      {!zenMode && (
        <h3 className="mb-8 text-center text-xs md:text-sm font-black tracking-widest text-slate-400 uppercase">
          {t.categories?.Phonem || 'Phonemes'}
        </h3>
      )}

      {/* 2. The Target Word */}
      <div
        className={`font-black ${wordSize} mb-2 text-center tracking-tight break-words text-slate-800 leading-tight w-full px-2`}
      >
        <BionicText text={targetWord} enabled={bionicReading} />
      </div>

      {/* 3. Phonetic Transcription */}
      {data.phonetic && (
        <div className="mb-8 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 font-mono text-xl font-bold tracking-widest text-slate-400">
          {data.phonetic}
        </div>
      )}

      {/* 4. Hint Text (Hidden in Zen Mode to force focus on the word) */}
      {!zenMode && hintText && (
        <div className="mb-12 px-4 text-center leading-relaxed font-medium text-slate-500">
          💡 <BionicText text={hintText} enabled={bionicReading} />
        </div>
      )}

      {/* 5. Voice & Audio Controls */}
      <div className="mb-8 flex gap-8">
        <button
          onClick={readWordAndHint}
          className={`${controlBtnSize} flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 shadow-sm transition-all hover:text-slate-600 active:scale-90`}
          aria-label={t.readAloud || 'Spell word aloud'}
        >
          🔊
        </button>

        <button
          onClick={() => startListening(null, null, handleVoiceInput)}
          className={`${controlBtnSize} flex items-center justify-center rounded-full shadow-xl transition-all active:scale-95 ${
            isListening
              ? pulseClass + ' text-white'
              : `${themeStyles.button} text-white hover:brightness-110`
          }`}
          aria-label={isListening ? t.listening : t.tapAndPronounce}
        >
          {isListening ? '🛑' : '🎤'}
        </button>
      </div>

      {/* 6. Transcript Feedback */}
      {transcript && (
        <p className="mb-4 text-center text-xs font-black tracking-widest text-slate-400 uppercase">
          {t.heard}: <span className="text-slate-600">{transcript}</span>
        </p>
      )}

      {/* 7. Manual Check Override (Fallback) */}
      <div className="mt-4 flex shrink-0 justify-center">
        <button
          onClick={onSuccess}
          className="rounded-full border-2 border-slate-200 bg-transparent px-6 py-3 text-xs md:text-sm font-black tracking-widest text-slate-400 uppercase transition-colors hover:bg-slate-50 hover:text-slate-600"
          aria-label={t.skipPronunciation}
        >
          {t.done || 'Done'}
        </button>
      </div>
    </div>
  );
}

export default PhonemeExercise;
