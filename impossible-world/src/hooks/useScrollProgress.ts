import { useEffect, useRef } from 'react';
import { clamp, lerp } from '../utils/math';

export const useScrollProgress = () => {
  // We use two refs: one for the raw scroll input, one for the smoothed cinematic progress.
  // By exporting both, components can bind their render loops to the *smoothed* value.
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);

  useEffect(() => {
    let requestRef: number;
    let isVisible = !document.hidden;

    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) {
        targetProgressRef.current = 0;
        return;
      }
      targetProgressRef.current = clamp(window.scrollY / maxScroll, 0, 1);
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible && !requestRef) {
        requestRef = requestAnimationFrame(render);
      }
    };

    const render = () => {
      if (!isVisible) {
        requestRef = 0;
        return;
      }

      const target = targetProgressRef.current;
      const current = currentProgressRef.current;
      const dist = Math.abs(current - target);

      // Adaptive lerp physics:
      // When far away (fast scroll), accelerate catch-up (e.g. 0.3)
      // When close (slow scroll or settling), ease smoothly (e.g. 0.05)
      // This prevents the "sluggish" feeling while maintaining heavy cinematic weight.
      if (dist > 0.0001) { // EPSILON to prevent micro-jitter
        const dynamicLerp = clamp(0.06 + dist * 0.8, 0.06, 0.3);
        currentProgressRef.current = lerp(current, target, dynamicLerp);
      } else {
        currentProgressRef.current = target;
      }

      requestRef = requestAnimationFrame(render);
    };

    // Attach listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Initialize
    handleScroll();
    currentProgressRef.current = targetProgressRef.current; // Start immediately at correct position without sliding from 0
    requestRef = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(requestRef);
    };
  }, []);

  // Return both so components can use the raw target if needed, but primarily use the smoothed current.
  return { targetProgressRef, currentProgressRef };
};
