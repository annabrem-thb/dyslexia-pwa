import React from 'react';

export default function AccessibleTTS({ text, speak, children, className = "" }) {
  const handleRead = (e) => {
    // Wywołanie systemowego TTS z wymuszonym wolniejszym tempem (slow = true)
    if (speak && text) speak(text, true); 
  };

  return (
    <div 
      className={`group relative inline-flex items-center gap-1 cursor-pointer w-full ${className}`}
      onClick={handleRead}
      title="Czytaj na głos / Read aloud"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleRead(e); }}
    >
      {children}
      <span 
        className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-200 text-slate-700 rounded-full w-4 h-4 flex items-center justify-center shrink-0 ml-1 shadow-sm" 
        aria-hidden="true"
      >
        🔊
      </span>
    </div>
  );
}