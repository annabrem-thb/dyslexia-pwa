import { useCallback } from 'react';

/**
 * Hook to handle auditory and haptic feedback for user actions.
 */
export function useFeedback() {
  const playSound = useCallback((type) => {
    const sounds = {
      success: '/assets/sounds/success.mp3',
      error: '/assets/sounds/error.mp3',
      click: '/assets/sounds/click.mp3',
    };

    const audio = new Audio(sounds[type]);
    // Fix: Removed unused 'e' or replaced with underscore if needed
    audio.play().catch(() => {
      console.warn(
        'Audio play blocked: Browser requires user interaction first.',
      );
    });
  }, []);

  const triggerVibration = useCallback((type) => {
    if (!navigator.vibrate) return;
    if (type === 'error') navigator.vibrate([100, 50, 100]);
    else if (type === 'success') navigator.vibrate(50);
  }, []);

  return { playSound, triggerVibration };
}
