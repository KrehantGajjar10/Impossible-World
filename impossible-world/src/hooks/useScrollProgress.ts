import { useEffect, useRef } from 'react';
import { clamp } from '../utils/math';

export const useScrollProgress = () => {
  // Store scroll progress in a ref to avoid React re-renders on every scroll tick
  const scrollProgressRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate the maximum scrollable distance
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      // If there is no scrollable space, default to 0
      if (maxScroll <= 0) {
        scrollProgressRef.current = 0;
        return;
      }
      
      // Calculate progress and clamp between 0 and 1
      const progress = window.scrollY / maxScroll;
      scrollProgressRef.current = clamp(progress, 0, 1);
    };

    // Attach listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Initial calculation
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return scrollProgressRef;
};
