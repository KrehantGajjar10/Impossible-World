import { useEffect, useRef } from 'react';
import { journeyState } from '../journey/journeyState';

const SECTIONS = [
  { threshold: 0.25, label: '01 — THE MONOLITH' },
  { threshold: 0.50, label: '02 — THE GATEWAY' },
  { threshold: 0.75, label: '03 — THE FRACTURE' },
  { threshold: 1.01, label: '04 — THE VOID' } // slightly above 1 to catch the exact end
];

export const JourneyUI = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId: number;
    let currentLabel = '';

    const loop = () => {
      const p = journeyState.progress;

      // Update dot position (using top offset or transform)
      // The line is 200px tall. Dot travels 0 to 200px.
      if (dotRef.current) {
        dotRef.current.style.transform = `translateY(${p * 200}px)`;
        
        // Color transition based on progress (passing 0.5 into the Void)
        if (p > 0.5) {
          const colorIntensity = Math.min(1, (p - 0.5) * 4); // 0 to 1
          const r = Math.floor(255);
          const g = Math.floor(255 - (colorIntensity * 190)); // 255 -> 65
          const b = Math.floor(255 - (colorIntensity * 190)); // 255 -> 65
          dotRef.current.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
          dotRef.current.style.boxShadow = `0 0 10px rgba(${r}, ${g}, ${b}, 0.8)`;
        } else {
          dotRef.current.style.backgroundColor = 'white';
          dotRef.current.style.boxShadow = '0 0 10px rgba(255,255,255,0.8)';
        }
      }

      // Update label
      if (labelRef.current) {
        const activeSection = SECTIONS.find(s => p < s.threshold) || SECTIONS[3];
        if (activeSection.label !== currentLabel) {
          currentLabel = activeSection.label;
          labelRef.current.innerText = currentLabel;
        }
      }

      frameId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 50,
      fontFamily: 'monospace',
      color: 'white'
    }}>
      {/* Branding */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '40px',
        opacity: 0.5,
        letterSpacing: '0.2em'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>IMPOSSIBLE WORLD</div>
        <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.6 }}>AN EXPERIMENT IN SPATIAL IMPOSSIBILITY</div>
      </div>

      {/* Progress Indicator */}
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '40px',
        transform: 'translateY(-50%)',
        height: '200px',
        width: '1px',
        background: 'rgba(255,255,255,0.2)',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div 
          ref={dotRef}
          style={{
            position: 'absolute',
            top: '-2px',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 0 10px rgba(255,255,255,0.8)'
          }}
        />
      </div>

      {/* Current Journey Label */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '40px',
        opacity: 0.7,
        letterSpacing: '0.15em',
        fontSize: '12px'
      }} ref={labelRef}>
        01 — THE MONOLITH
      </div>
    </div>
  );
};
