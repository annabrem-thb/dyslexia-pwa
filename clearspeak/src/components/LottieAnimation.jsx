import React from 'react';
import Lottie from 'lottie-react';

/**
 * LottieAnimation Wrapper
 * 
 * SDT & WCAG Implementation:
 * - Provides satisfying visual feedback (Competence reinforcement).
 * - Respects cognitive/sensory load by falling back to a static element 
 *   if the user has "noFlash" or reduced motion enabled.
 * - Manages ARIA attributes to prevent screen reader clutter.
 */
export default function LottieAnimation({ 
  animationData, 
  loop = false, 
  noFlash = false, 
  className = "", 
  fallbackEmoji = "🌱",
  ariaLabel = "Success animation"
}) {
  // 1. Accessibility Guard: Disable motion if requested
  if (noFlash) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        aria-label={ariaLabel}
        role="img"
      >
        <span className="text-6xl drop-shadow-md animate-in fade-in duration-700">
          {fallbackEmoji}
        </span>
      </div>
    );
  }

  // 2. Standard Render: Smooth Lottie Animation
  return (
    <div 
      className={className} 
      aria-label={ariaLabel} 
      role="img"
    >
      {/* aria-hidden is applied to the Lottie element itself so the screen reader 
          reads the wrapper's aria-label instead of parsing SVG nodes */}
      <Lottie 
        animationData={animationData} 
        loop={loop} 
        autoplay={true} 
        aria-hidden="true" 
      />
    </div>
  );
}