import { useEffect } from 'react';
import { journeyState } from './journeyState';

export const ScrollTracker = () => {
  useEffect(() => {
    const calculateProgress = () => {
      // Calculate max scrollable distance
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      if (maxScroll > 0) {
        // Clamp between 0 and 1
        let progress = window.scrollY / maxScroll;
        progress = Math.max(0, Math.min(1, progress));
        journeyState.progress = progress;
      } else {
        journeyState.progress = 0;
      }
    };

    // Calculate immediately on mount for scroll restoration
    calculateProgress();

    // Attach passive listeners
    window.addEventListener('scroll', calculateProgress, { passive: true });
    window.addEventListener('resize', calculateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', calculateProgress);
      window.removeEventListener('resize', calculateProgress);
    };
  }, []);

  return null;
};
