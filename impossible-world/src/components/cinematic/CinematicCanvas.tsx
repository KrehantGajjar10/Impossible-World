import { useEffect, useRef, useState } from 'react';
import { FrameLoader } from './FrameLoader';

const TOTAL_FRAMES = 600;
const ORIGINAL_WIDTH = 1920;
const ORIGINAL_HEIGHT = 1080;

export const CinematicCanvas = ({ scrollProgressRef }: { scrollProgressRef: React.MutableRefObject<number> }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isReady, setIsReady] = useState(false);
  
  const loaderRef = useRef<FrameLoader | null>(null);
  const currentRenderFrameRef = useRef(0);
  const lastTargetFrameRef = useRef(0);
  const requestRef = useRef<number>(null);
  
  // Cache resize values so we don't calculate aspect ratio inside the 60fps loop
  const renderBoundsRef = useRef({ offsetX: 0, offsetY: 0, drawWidth: 0, drawHeight: 0 });

  useEffect(() => {
    // 1. Initialize Loader
    const loader = new FrameLoader(TOTAL_FRAMES);
    loaderRef.current = loader;
    
    // Preload first 30 frames for an instant start
    loader.initialize(30).then(() => {
      setIsReady(true);
      
      // Draw first frame immediately
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        const img = loader.getClosestFrame(0);
        if (ctx && img) {
          const { offsetX, offsetY, drawWidth, drawHeight } = renderBoundsRef.current;
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        }
      }
    });

    // 2. The Render Loop
    const startRenderLoop = () => {
      let isVisible = !document.hidden;

      const handleVisibilityChange = () => {
        isVisible = !document.hidden;
        if (isVisible && !requestRef.current) {
          requestRef.current = requestAnimationFrame(render);
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      const render = () => {
        if (!isVisible) {
          requestRef.current = null;
          return;
        }

        if (canvasRef.current && loaderRef.current && isReady) {
          const ctx = canvasRef.current.getContext('2d');
          
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            const maxFrameIndex = TOTAL_FRAMES - 1;
            const targetFrame = scrollProgressRef.current * maxFrameIndex;
            
            // Determine scroll direction for preloading
            const direction = targetFrame >= lastTargetFrameRef.current ? 1 : -1;
            lastTargetFrameRef.current = targetFrame;
            
            // Trigger preloading
            loaderRef.current.updatePreloadQueue(Math.round(targetFrame), direction);
            
            // The scroll progress is now naturally smoothed by useScrollProgress, 
            // so we directly use the targetFrame as our current render frame.
            currentRenderFrameRef.current = targetFrame;
            
            // Draw current frame
            const drawFrameIndex = Math.round(currentRenderFrameRef.current);
            const img = loaderRef.current.getClosestFrame(drawFrameIndex);

            if (img) {
              const { offsetX, offsetY, drawWidth, drawHeight } = renderBoundsRef.current;
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            }
          }
        }

        requestRef.current = requestAnimationFrame(render);
      };

      requestRef.current = requestAnimationFrame(render);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    };

    const cleanupLoop = startRenderLoop();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      cleanupLoop();
    };
  }, [scrollProgressRef, isReady]);

  // Handle Canvas Resizing correctly
  useEffect(() => {
    const resizeCanvas = () => {
      if (!canvasRef.current) return;
      
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const adjustedWidth = width * dpr;
      const adjustedHeight = height * dpr;

      canvasRef.current.width = adjustedWidth;
      canvasRef.current.height = adjustedHeight;
      
      // Calculate "cover" algorithm bounds ONCE per resize
      const canvasRatio = adjustedWidth / adjustedHeight;
      const imgRatio = ORIGINAL_WIDTH / ORIGINAL_HEIGHT;
      
      let drawWidth = adjustedWidth;
      let drawHeight = adjustedHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawHeight = adjustedWidth / imgRatio;
        offsetY = (adjustedHeight - drawHeight) / 2;
      } else {
        drawWidth = adjustedHeight * imgRatio;
        offsetX = (adjustedWidth - drawWidth) / 2;
      }
      
      renderBoundsRef.current = { offsetX, offsetY, drawWidth, drawHeight };
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial size

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <>
      {/* Loading Screen */}
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#050505',
        color: '#ffffff',
        zIndex: 100,
        opacity: isReady ? 0 : 1,
        pointerEvents: isReady ? 'none' : 'auto',
        transition: 'opacity 1s ease-out',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 300,
          letterSpacing: '0.4em',
          marginBottom: '12px'
        }}>
          IMPOSSIBLE WORLD
        </div>
        <div style={{
          fontSize: '10px',
          letterSpacing: '0.2em',
          opacity: 0.5
        }}>
          ENTERING THE WORLD
        </div>
      </div>

      <canvas 
        ref={canvasRef} 
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: -3,
          opacity: isReady ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out',
          backgroundColor: '#050505'
        }}
      />
      
      {/* Subtle Cinematic Overlay (Vignette + Slight Darkening) */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: -1,
        background: 'radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.4) 100%)',
        opacity: isReady ? 1 : 0,
        transition: 'opacity 1.5s ease-in-out'
      }} />
    </>
  );
};
