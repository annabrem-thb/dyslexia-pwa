/**
 * exerciseStyles - Centralized Tailwind classes for Accessibility and Themes.
 * Uses a factory pattern to inject user preferences (bigTargets, noFlash).
 */
export const getExerciseStyles = (bigTargets, noFlash) => ({
  // The small round buttons for Sound and Microphone
  controlBtn: `${
    bigTargets ? 'w-20 h-20 text-3xl' : 'w-16 h-16 text-2xl'
  } rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm border bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600`,

  // The main action buttons (Check, Delete)
  actionBtn: `${
    bigTargets ? 'py-5 px-10 text-xl' : 'py-3 px-6 text-lg'
  } font-black rounded-3xl transition-all shadow-xl active:scale-95`,

  // Animation classes
  pulse: noFlash
    ? 'bg-red-500'
    : 'bg-red-500 animate-pulse ring-8 ring-red-100',
  entry: noFlash ? '' : 'animate-in fade-in zoom-in duration-500',

  // Layout helpers
  container: 'flex flex-col items-center w-full max-w-4xl',
  grid: 'flex flex-wrap justify-center gap-4 w-full',
});
