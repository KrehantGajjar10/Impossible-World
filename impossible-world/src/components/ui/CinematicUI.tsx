import { useEffect, useRef } from 'react';
import { clamp } from '../../utils/math';

interface CinematicUIProps {
  scrollProgressRef: React.MutableRefObject<number>;
}

const CHAPTERS = [
  { id: 1, label: '01 — THE VALLEY DESCENT', start: 0.0, peak: 0.05, end: 0.4 },
  { id: 2, label: '02 — THE FLOATING ISLANDS', start: 0.4, peak: 0.45, end: 0.8 },
  { id: 3, label: '03 — THE MONOLITH', start: 0.8, peak: 0.85, end: 1.0 }
];

export const CinematicUI = ({ scrollProgressRef }: CinematicUIProps) => {
  const openingRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const progressDotRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);

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

      const p = scrollProgressRef.current;

      // 1. Opening Screen Fade (0 to 0.05)
      if (openingRef.current) {
        const openingOpacity = clamp(1 - (p / 0.05), 0, 1);
        const openingY = clamp((p / 0.05) * -50, -50, 0);
        openingRef.current.style.opacity = openingOpacity.toString();
        openingRef.current.style.transform = `translate(-50%, calc(-50% + ${openingY}px))`;
        openingRef.current.style.pointerEvents = openingOpacity > 0 ? 'auto' : 'none';
      }

      // 2. Persistent Brand Fade In (starts appearing after opening fades, e.g., 0.05 to 0.1)
      if (brandRef.current) {
        const brandOpacity = clamp((p - 0.05) / 0.05, 0, 0.4); // max opacity 0.4
        brandRef.current.style.opacity = brandOpacity.toString();
      }

      // 3. Scroll Progress Indicator
      if (progressLineRef.current && progressDotRef.current) {
        // Dot moves down the line
        progressDotRef.current.style.top = `${p * 100}%`;
      }

      // 4. Cinematic Chapters
      CHAPTERS.forEach((chapter, index) => {
        const el = chapterRefs.current[index];
        if (!el) return;

        let opacity = 0;
        
        if (p >= chapter.start && p <= chapter.end) {
          if (p < chapter.peak) {
            // Fade in to 1
            opacity = clamp((p - chapter.start) / (chapter.peak - chapter.start), 0, 1);
          } else if (p < chapter.end - 0.05) {
            // Fade from 1 to 0.3 (resting state)
            opacity = clamp(1 - ((p - chapter.peak) / (chapter.end - 0.05 - chapter.peak)) * 0.7, 0.3, 1);
          } else {
            // Fade out from 0.3 to 0
            opacity = clamp(0.3 * (1 - (p - (chapter.end - 0.05)) / 0.05), 0, 0.3);
          }
        }

        el.style.opacity = opacity.toString();
      });

      requestRef = requestAnimationFrame(render);
    };

    requestRef = requestAnimationFrame(render);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(requestRef);
    };
  }, [scrollProgressRef]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 50,
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Opening Screen */}
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
          pointerEvents: 'none'
        }}
      >
        <h1 style={{
          fontSize: 'clamp(24px, 4vw, 48px)',
          fontWeight: 300,
          letterSpacing: '0.5em',
          margin: '0 0 16px 0',
          textTransform: 'uppercase',
          textShadow: '0 4px 24px rgba(0,0,0,0.8)'
        }}>
          Impossible<br/>World
        </h1>
        <p style={{
          fontSize: '10px',
          letterSpacing: '0.3em',
          opacity: 0.6,
          margin: 0,
          textTransform: 'uppercase'
        }}>
          A Journey Through The Impossible
        </p>
        
        {/* Subtle scroll indicator */}
        <div style={{
          marginTop: '64px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: 0.4
        }}>
          <span style={{ fontSize: '9px', letterSpacing: '0.2em', marginBottom: '12px' }}>
            SCROLL TO EXPLORE
          </span>
          <div 
            className="animate-scroll-hint"
            style={{
            width: '1px',
            height: '40px',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)'
          }} />
        </div>
      </div>

      {/* Persistent Brand */}
      <div 
        ref={brandRef}
        style={{
          position: 'absolute',
          top: '32px',
          left: '32px',
          fontSize: '10px',
          fontWeight: 400,
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          opacity: 0,
          textShadow: '0 2px 8px rgba(0,0,0,0.8)'
        }}
      >
        Impossible World
      </div>

      {/* Scroll Progress Line */}
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '32px',
        transform: 'translateY(-50%)',
        height: '200px',
        width: '1px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div 
          ref={progressLineRef}
          style={{ width: '100%', height: '100%' }}
        >
          <div 
            ref={progressDotRef}
            style={{
              position: 'absolute',
              top: '0%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '3px',
              height: '3px',
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              boxShadow: '0 0 8px rgba(255,255,255,0.8)'
            }}
          />
        </div>
      </div>

      {/* Cinematic Chapters */}
      <div style={{
        position: 'absolute',
        bottom: '48px',
        left: '32px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {CHAPTERS.map((chapter, i) => (
          <div 
            key={chapter.id}
            ref={el => { chapterRefs.current[i] = el; }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              opacity: 0,
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              textShadow: '0 2px 12px rgba(0,0,0,0.8)',
              whiteSpace: 'nowrap'
            }}
          >
            {chapter.label}
          </div>
        ))}
      </div>

    </div>
  );
};
