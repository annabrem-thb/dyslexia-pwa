import React, { useMemo } from 'react';

export default function VirtualGarden({ 
  points, 
  streak, 
  dailyQuests, 
  isHighContrast,
  theme = 'Natur',
  t,
  themeStyles,
  activeCategory = null,
  isFullScreen = false
}) {
  // 1. Ecosystem Mapping Logic
  const ecosystemState = useMemo(() => {
    // Map total points to the main plant's structural growth
    const growthLevel = Math.floor(points / 5);
    
    // Map categories/pillars to specific plant species (requirement from the academic roadmap)
    const categoryPlants = {
      // Main pillars from i18n.js
      Spelling:  ['🌱', '🌿', '🪴', '🎋', '🌳'], // Species A: Ivy / Climbing plants (Reading/Spelling)
      Structure: ['🌱', '🌿', '🪴', '🌲', '🌴'], // Species B: Ferns / Structural plants (Writing/Grammar)
      Memory:    ['🌱', '🌿', '🌷', '🌻', '🌺'], // Species C: Flowering herbs (Listening/Memory)
      Spatial:   ['🌱', '🪴', '🌵', '🏜️', '🌸'], // Species D: Cacti / Succulents (Spatial/Tracking)
      
      // Direct module names (as fallback depending on what App.jsx passes)
      Graphem:   ['🌱', '🌿', '🪴', '🎋', '🌳'],
      Wortbild:  ['🌱', '🌿', '🪴', '🎋', '🌳'],
      Phonem:    ['🌱', '🌿', '🌷', '🌻', '🌺'],
      Silben:    ['🌱', '🌿', '🌷', '🌻', '🌺'],
      Context:   ['🌱', '🌿', '🪴', '🌲', '🌴'],
    };

    // Prioritize icons based on the active category only for the Natur theme, otherwise use the global theme
    const isNature = theme === 'Natur';
    const themeIcons = (isNature && activeCategory && categoryPlants[activeCategory])
      ? categoryPlants[activeCategory]
      : (t?.levelIcons?.[theme] || ['🌱', '🌿', '🌳', '🌲', '🍎']);
      
    const themeStages = t?.progressStages?.[theme] || ["Seed", "Stem", "Bud", "Blooming", "Flower"];

    const stageIndex = Math.min(growthLevel, themeIcons.length - 1);
    const plantVisual = themeIcons[stageIndex];
    const plantName = themeStages[stageIndex];

    // Map completed optional quests to blooming flowers
    const completedModules = dailyQuests?.tasks?.filter(t => t.completed).length || 0;
    
    const questIconsByTheme = {
      Natur: '🌸',
      Musik: '✨',
      Kunst: '⭐',
      Space: '💫',
      Ocean: '🫧'
    };
    const questIcon = questIconsByTheme[theme] || '🌸';
    const flowers = Array.from({ length: completedModules }).map(() => questIcon);

    // Map consistency (streak) to environmental fauna based on theme and points
    const visitorsByTheme = {
      Natur: ['🦋', '🐝', '🐞', '🐿️', '🦊'],
      Musik: ['🐦', '🕊️', '🦜', '🦚', '🦢'],
      Kunst: ['🐌', '🐛', '🦎', '🦔', '🦉'],
      Space: ['☄️', '🛸', '🛰️', '👽', '👨‍🚀'],
      Ocean: ['🦀', '🐢', '🐡', '🐙', '🐬'],
    };
    
    const themeVisitors = visitorsByTheme[theme] || visitorsByTheme.Natur;
    const hasVisitor = streak >= 3;
    
    // Pick a visitor that evolves as the plant grows
    const visitorIndex = Math.min(growthLevel, themeVisitors.length - 1);
    const visitor = hasVisitor ? themeVisitors[visitorIndex] : '';

    return { plantVisual, plantName, flowers, hasVisitor, visitor, completedModules, themeVisitors };
  }, [points, streak, dailyQuests, theme, t, activeCategory]);

  // 2. Accessibility Screen Reader Text (WCAG Compliant)
  const srText = `${t.srPlantFeature || 'Deine Reise beinhaltet aktuell ein(e)'} ${ecosystemState.plantName}. 
    ${ecosystemState.completedModules > 0 ? `${t.srDailyRewards || 'Es hat'} ${ecosystemState.completedModules} ${t.srRewardsCount || 'tägliche Belohnungen.'}` : ''} 
    ${ecosystemState.hasVisitor ? (t.srVisitor || 'Ein freundlicher Besucher hat sich dir aufgrund deiner beständigen Übung angeschlossen.') : ''}`;

  // Dynamic classes based on full screen state
  const containerClasses = isFullScreen
    ? `relative flex flex-col items-center justify-center gap-8 w-full h-full p-6 sm:p-10 rounded-4xl transition-all duration-1000 ${isHighContrast ? 'bg-black border-4 border-white/30' : `${themeStyles?.bg || 'bg-slate-50'} border-4 ${themeStyles?.border || 'border-transparent'} shadow-2xl`}`
    : `relative flex items-center justify-start gap-3 flex-1 h-12 px-3 rounded-2xl border transition-all duration-700 ${isHighContrast ? 'bg-transparent border-white/30' : `${themeStyles?.bg || 'bg-slate-50'} ${themeStyles?.border || 'border-transparent'} shadow-inner`}`;

  const plantTextSize = isFullScreen ? 'text-[120px] md:text-[160px]' : 'text-3xl';
  const flowerTextSize = isFullScreen ? 'text-4xl md:text-5xl' : 'text-lg';
  const visitorTextSize = isFullScreen ? 'text-6xl md:text-8xl' : 'text-2xl';
  const visitorPosition = isFullScreen ? 'absolute top-12 right-12 md:top-20 md:right-20' : 'absolute -top-3 right-2';

  return (
    <div className={containerClasses} aria-label="Progress Bar">
      {/* Screen Reader Only Announcement */}
      <div className="sr-only" aria-live="polite">
        {srText}
      </div>

      {/* Visual Garden Elements (Hidden from Screen Readers to avoid emoji clutter) */}
      <div className={`flex ${isFullScreen ? 'flex-col justify-center' : 'items-center'} gap-4 w-full`} aria-hidden="true">
        {/* Main Plant */}
        <div 
          key={ecosystemState.plantVisual}
          className={`${plantTextSize} animate-in zoom-in slide-in-from-bottom-4 duration-1000 drop-shadow-lg`}
        >
          {ecosystemState.plantVisual}
        </div>

        {/* Blooming Flowers based on daily quests */}
        <div className={`flex flex-wrap ${isFullScreen ? 'justify-center gap-4' : 'gap-0.5 items-center'}`}>
          {ecosystemState.flowers.map((flower, i) => (
            <span 
              key={i} 
              className={`${flowerTextSize} animate-in zoom-in duration-500 delay-150 drop-shadow-md`}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {flower}
            </span>
          ))}
        </div>
      </div>

      {/* Consistency Fauna (Streak Visitor) */}
      {ecosystemState.hasVisitor && (
        <div 
          key={ecosystemState.visitor}
          className={`${visitorPosition} ${visitorTextSize} drop-shadow-xl animate-in zoom-in slide-in-from-top-8 duration-1000`} 
          aria-hidden="true"
        >
          <div className="animate-bounce" style={{ animationDuration: '4s' }}>
            {ecosystemState.visitor}
          </div>
        </div>
      )}

      {/* Extended Text Only For Full Screen Dashboard */}
      {isFullScreen && (
        <div className="flex flex-col items-center gap-2 mt-8 animate-in fade-in duration-1000 delay-500">
          <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-widest ${isHighContrast ? 'text-white' : themeStyles?.accent || 'text-slate-800'}`}>
            {ecosystemState.plantName}
          </h2>
          <p className={`text-sm font-medium max-w-xs text-center leading-relaxed ${isHighContrast ? 'text-white/70' : 'text-slate-500'}`}>
            {ecosystemState.completedModules > 0 
              ? `${t.gardenBlooming || 'Der Garten blüht! Erreichte Ziele:'} ${ecosystemState.completedModules}` 
              : (t.gardenEmpty || 'Dein eigenes Ökosystem. Es wächst mit jedem deiner Fortschritte.')}
          </p>
        </div>
      )}
    </div>
  );
}