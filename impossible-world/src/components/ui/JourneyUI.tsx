import { useEffect, useRef } from 'react';
import { journeyState } from '../journey/journeyState';

const SECTIONS = [
  { threshold: 0.25, num: '01', title: 'THE MONOLITH', subtitle: 'STRUCTURE / ORIGIN' },
  { threshold: 0.50, num: '02', title: 'THE GATEWAY', subtitle: 'STRUCTURE / TRANSITION' },
  { threshold: 0.75, num: '03', title: 'THE FRACTURE', subtitle: 'DIMENSION / COLLAPSE' },
  { threshold: 1.01, num: '04', title: 'THE VOID', subtitle: 'DIMENSION / UNKNOWN' }
];

export const JourneyUI = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelNumRef = useRef<HTMLDivElement>(null);
  const labelTitleRef = useRef<HTMLDivElement>(null);
  const labelSubRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId: number;
    let currentTitle = '';

    const loop = () => {
      const p = journeyState.progress;

      // Update dot position using top percentage
      if (dotRef.current) {
        dotRef.current.style.top = `${p * 100}%`;
        
        // Color transition based on progress (passing 0.5 into the Void)
        if (p > 0.5) {
          const colorIntensity = Math.min(1, (p - 0.5) * 4); // 0 to 1
          const r = Math.floor(255);
          const g = Math.floor(255 - (colorIntensity * 190));
          const b = Math.floor(255 - (colorIntensity * 190));
          dotRef.current.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
          dotRef.current.style.boxShadow = `0 0 8px rgba(${r}, ${g}, ${b}, 0.8)`;
        } else {
          dotRef.current.style.backgroundColor = 'white';
          dotRef.current.style.boxShadow = '0 0 8px rgba(255,255,255,0.8)';
        }
      }

      // Update label
      const activeSection = SECTIONS.find(s => p < s.threshold) || SECTIONS[3];
      if (activeSection.title !== currentTitle) {
        currentTitle = activeSection.title;
        if (labelNumRef.current) labelNumRef.current.innerText = activeSection.num;
        if (labelTitleRef.current) labelTitleRef.current.innerText = activeSection.title;
        if (labelSubRef.current) labelSubRef.current.innerText = activeSection.subtitle;
      }

      frameId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="journey-ui">
      {/* Branding */}
      <div className="journey-branding">
        <div className="branding-title">IMPOSSIBLE<br/>WORLD</div>
        <div className="branding-subtitle">SPATIAL STUDY / 001</div>
      </div>

      {/* Progress Indicator */}
      <div className="journey-progress-container">
        <div className="progress-num">01</div>
        <div className="progress-track">
          <div ref={dotRef} className="progress-dot" />
        </div>
        <div className="progress-num">04</div>
      </div>

      {/* Current Journey Label */}
      <div className="journey-label">
        <div className="label-num" ref={labelNumRef}>01</div>
        <div className="label-title" ref={labelTitleRef}>THE MONOLITH</div>
        <div className="label-subtitle" ref={labelSubRef}>STRUCTURE / ORIGIN</div>
      </div>
    </div>
  );
};
