import { useEffect, useRef } from 'react';
import { clamp } from '../../utils/math';

interface CinematicUIProps {
  scrollProgressRef: React.MutableRefObject<number>;
}

const CHAPTERS = [
  { 
    id: 1, 
    num: '01',
    title: 'THE VALLEY', 
    subtitle: 'Where the familiar begins.',
    start: 0.05, peak: 0.1, end: 0.35 
  },
  { 
    id: 2, 
    num: '02',
    title: 'THE FLOATING WORLD', 
    subtitle: 'Gravity is no longer absolute.',
    start: 0.4, peak: 0.45, end: 0.7 
  },
  { 
    id: 3, 
    num: '03',
    title: 'BEYOND THE MONOLITH', 
    subtitle: 'Something has been waiting here.',
    start: 0.75, peak: 0.8, end: 0.9 
  }
];

export const CinematicUI = ({ scrollProgressRef }: CinematicUIProps) => {
  const openingRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const progressDotRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const finalPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let requestRef: number;
    let isVisible = !document.hidden;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible && !requestRef) {
        requestRef = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (!isVisible) {
        requestRef = 0;
        return;
      }

      // The scrollProgressRef now inherently carries smoothed cinematic interpolation.
      const p = scrollProgressRef.current;

      // 1. Opening Screen Fade (0 to 0.05)
      if (openingRef.current) {
        const openingOpacity = clamp(1 - (p / 0.05), 0, 1);
        const openingY = clamp((p / 0.05) * -50, -50, 0);
        openingRef.current.style.opacity = openingOpacity.toString();
        openingRef.current.style.transform = `translate(-50%, calc(-50% + ${openingY}px))`;
        openingRef.current.style.pointerEvents = openingOpacity > 0.5 ? 'auto' : 'none';
      }

      // 2. Persistent Brand Fade In (0.05 to 0.1)
      if (brandRef.current) {
        const brandOpacity = clamp((p - 0.05) / 0.05, 0, 0.6); // Stronger contrast
        brandRef.current.style.opacity = brandOpacity.toString();
        
        // Hide at the very end to clear screen for final panel
        if (p > 0.92) {
            brandRef.current.style.opacity = clamp((1 - p) / 0.08, 0, 0.6).toString();
        }
      }

      // 3. Scroll Progress Indicator (Right side)
      if (progressLineRef.current && progressDotRef.current) {
        progressDotRef.current.style.top = `${p * 100}%`;
        
        // Hide softly as the final panel comes in
        const progressOpacity = p > 0.90 ? clamp(1 - ((p - 0.90) / 0.05), 0, 1) : 1;
        progressLineRef.current.parentElement!.style.opacity = progressOpacity.toString();
      }

      // 4. Cinematic Chapters
      CHAPTERS.forEach((chapter, index) => {
        const el = chapterRefs.current[index];
        if (!el) return;

        let opacity = 0;
        let yOffset = 20; 
        
        if (p >= chapter.start && p <= chapter.end) {
          if (p < chapter.peak) {
            const ratio = (p - chapter.start) / (chapter.peak - chapter.start);
            opacity = clamp(ratio, 0, 1);
            yOffset = 20 * (1 - ratio);
          } else if (p < chapter.end - 0.05) {
            opacity = 1;
            yOffset = 0;
          } else {
            const ratio = (p - (chapter.end - 0.05)) / 0.05;
            opacity = clamp(1 - ratio, 0, 1);
            yOffset = -10 * ratio; 
          }
        }

        el.style.opacity = opacity.toString();
        el.style.transform = `translateY(${yOffset}px)`;
        el.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
      });

      // 5. Final Moment Screen (Appears 0.93 -> 1.0)
      // The user requested a slow, cinematic fade-in for the final panel.
      if (finalPanelRef.current) {
        let finalOpacity = 0;
        let finalY = 40;
        
        if (p > 0.93) {
            // Smoothly fade in from 0.93 to 0.97
            const ratio = clamp((p - 0.93) / 0.04, 0, 1);
            finalOpacity = ratio;
            finalY = 40 * (1 - ratio);
        }
        
        finalPanelRef.current.style.opacity = finalOpacity.toString();
        finalPanelRef.current.style.transform = `translate(-50%, calc(-50% + ${finalY}px))`;
        finalPanelRef.current.style.pointerEvents = finalOpacity > 0.5 ? 'auto' : 'none';
      }

      requestRef = requestAnimationFrame(render);
    };

    requestRef = requestAnimationFrame(render);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(requestRef);
    };
  }, [scrollProgressRef]);

  const handleExploreAgain = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 50,
      color: 'rgba(255,255,255,0.95)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* 1. Opening Screen */}
      <div 
        ref={openingRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          pointerEvents: 'auto',
          width: '100%',
          padding: '0 24px',
          boxSizing: 'border-box'
        }}
      >
        <span style={{
          fontSize: 'clamp(9px, 2vw, 12px)',
          letterSpacing: '0.4em',
          opacity: 0.8,
          marginBottom: '24px',
          textTransform: 'uppercase',
          textShadow: '0 2px 12px rgba(0,0,0,0.8)'
        }}>
          An Experimental Cinematic World
        </span>
        <h1 style={{
          fontSize: 'clamp(36px, 8vw, 84px)',
          fontWeight: 300,
          letterSpacing: '0.3em',
          margin: '0 0 24px 0',
          textTransform: 'uppercase',
          textShadow: '0 4px 24px rgba(0,0,0,0.9)'
        }}>
          Impossible<br/>World
        </h1>
        <p style={{
          fontSize: 'clamp(10px, 2.5vw, 14px)',
          letterSpacing: '0.3em',
          opacity: 0.8,
          margin: 0,
          textTransform: 'uppercase',
          textShadow: '0 2px 12px rgba(0,0,0,0.8)'
        }}>
          A Journey Beyond The Laws Of Nature
        </p>
        
        {/* Subtle scroll hint */}
        <div style={{
          marginTop: '8vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: 0.7
        }}>
          <span style={{ 
            fontSize: '10px', 
            letterSpacing: '0.2em', 
            marginBottom: '16px',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)'
          }}>
            SCROLL TO EXPLORE
          </span>
          <div 
            className="animate-scroll-hint"
            style={{
              width: '1px',
              height: '40px',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.8), transparent)'
          }} />
        </div>
      </div>

      {/* 2. Persistent Brand */}
      <div 
        ref={brandRef}
        style={{
          position: 'absolute',
          top: 'clamp(24px, 4vw, 40px)',
          left: 'clamp(24px, 4vw, 40px)',
          display: 'flex',
          flexDirection: 'column',
          opacity: 0,
          textShadow: '0 2px 12px rgba(0,0,0,0.9)'
        }}
      >
        <span style={{
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          marginBottom: '4px'
        }}>
          Impossible World
        </span>
        <span style={{
          fontSize: '9px',
          opacity: 0.8,
          letterSpacing: '0.2em',
          textTransform: 'uppercase'
        }}>
          Digital Environment / 001
        </span>
      </div>

      {/* 3. Scroll Progress Indicator */}
      <div style={{
        position: 'absolute',
        top: '50%',
        right: 'clamp(16px, 3vw, 40px)',
        transform: 'translateY(-50%)',
        height: '25vh',
        minHeight: '150px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'opacity 0.5s ease'
      }}>
        <span style={{
          fontSize: '9px',
          letterSpacing: '0.3em',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          opacity: 0.6,
          marginBottom: '16px',
          textShadow: '0 2px 8px rgba(0,0,0,0.8)'
        }}>
          JOURNEY
        </span>
        <div style={{
          width: '1px',
          flexGrow: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          position: 'relative'
        }}>
          <div 
            ref={progressLineRef}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
          >
            <div 
              ref={progressDotRef}
              style={{
                position: 'absolute',
                top: '0%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '2px',
                height: '16px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: '2px',
                boxShadow: '0 0 12px rgba(255,255,255,0.6)'
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. Cinematic Chapters (Responsive Museum Glass Cards) */}
      <div style={{
        position: 'absolute',
        bottom: 'clamp(32px, 6vw, 64px)',
        left: 'clamp(24px, 4vw, 40px)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {CHAPTERS.map((chapter, i) => (
          <div 
            key={chapter.id}
            ref={el => { chapterRefs.current[i] = el; }}
            className="museum-glass"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              opacity: 0,
              padding: 'clamp(20px, 3vw, 24px) clamp(24px, 4vw, 32px)',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '240px',
              maxWidth: '85vw'
            }}
          >
            <span style={{
              fontSize: '11px',
              letterSpacing: '0.2em',
              opacity: 0.7,
              marginBottom: '8px',
              fontWeight: 500
            }}>
              {chapter.num}
            </span>
            <span style={{
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              fontWeight: 500,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              marginBottom: '12px',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
              {chapter.title}
            </span>
            <span style={{
              fontSize: 'clamp(11px, 2vw, 12px)',
              opacity: 0.8,
              letterSpacing: '0.1em',
              fontWeight: 300
            }}>
              {chapter.subtitle}
            </span>
          </div>
        ))}
      </div>

      {/* 5. Final Moment Screen */}
      <div 
        ref={finalPanelRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '560px',
          opacity: 0,
          pointerEvents: 'none',
          padding: '0',
          boxSizing: 'border-box'
        }}
      >
        <div 
          className="museum-glass" 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: 'clamp(32px, 5vw, 48px) clamp(24px, 4vw, 40px)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          <h2 style={{
            fontSize: 'clamp(24px, 5vw, 36px)',
            fontWeight: 300,
            letterSpacing: '0.3em',
            margin: '0 0 16px 0',
            textTransform: 'uppercase',
            textShadow: '0 2px 8px rgba(0,0,0,0.6)'
          }}>
            Impossible World
          </h2>
          <p style={{
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            opacity: 0.9,
            letterSpacing: '0.15em',
            margin: '0 0 40px 0',
            fontWeight: 400
          }}>
            Beyond what should exist.
          </p>
          
          <div style={{
            width: '100%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
            marginBottom: '40px'
          }} />

          <p style={{ 
            fontSize: 'clamp(11px, 2vw, 12px)', 
            lineHeight: 1.8, 
            opacity: 0.8, 
            margin: '0 0 24px 0', 
            fontWeight: 300,
            maxWidth: '400px'
          }}>
            An impossible landscape discovered beyond the limits of ordinary geography.
          </p>
          
          <p style={{ 
            fontSize: 'clamp(10px, 2vw, 11px)', 
            opacity: 0.6, 
            margin: '0 0 48px 0', 
            letterSpacing: '0.1em',
            fontWeight: 300
          }}>
            A cinematic experiment in environment, motion and imagination.
          </p>

          <button 
            className="museum-glass interactive-glass"
            onClick={handleExploreAgain}
            aria-label="Explore the cinematic world again"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: 'white',
              padding: '16px 32px',
              fontSize: '11px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              fontFamily: 'inherit',
              fontWeight: 500
            }}
          >
            Explore Again
          </button>
        </div>
      </div>

    </div>
  );
};
