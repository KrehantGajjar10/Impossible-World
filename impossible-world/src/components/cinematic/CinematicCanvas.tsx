import { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { FrameLoader } from './FrameLoader';
import { lerp } from '../../utils/math';

const TOTAL_FRAMES = 240; 
const ORIGINAL_WIDTH = 1920;
const ORIGINAL_HEIGHT = 1080;

export const CinematicCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollProgressRef = useScrollProgress();
  
  const [isReady, setIsReady] = useState(false);
  // Development diagnostics state (optional)
  const [devDiagnostics, setDevDiagnostics] = useState({ current: 0, target: 0, progress: 0 });
  const IS_DEV = import.meta.env.DEV; // Vite env flag
  
  const loaderRef = useRef<FrameLoader | null>(null);
  const currentRenderFrameRef = useRef(0);
  const requestRef = useRef<number>(null);
  
  // Cache resize values so we don't calculate aspect ratio inside the 60fps loop
  const renderBoundsRef = useRef({ offsetX: 0, offsetY: 0, drawWidth: 0, drawHeight: 0 });

  useEffect(() => {
    // 1. Initialize Loader
    const loader = new FrameLoader(TOTAL_FRAMES);
    loaderRef.current = loader;
    
    // Preload first 15 frames for an instant, smooth start
    loader.initialize(15).then(() => {
      setIsReady(true);
      startRenderLoop();
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

        if (!canvasRef.current || !loaderRef.current) return;
        
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        
        // Ensure smoothing is enabled
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const maxFrameIndex = TOTAL_FRAMES - 1;
        const targetFrameIndex = scrollProgressRef.current * maxFrameIndex;
        
        // Intelligent loading: Prioritize frames near where the user is scrolling
        const targetInt = Math.round(targetFrameIndex);
        loaderRef.current.prioritizeFrame(targetInt);
        loaderRef.current.loadSurroundingFrames(targetInt, 3);
        
        // Interpolate current frame towards target frame for cinematic smoothness
        currentRenderFrameRef.current = lerp(
          currentRenderFrameRef.current,
          targetFrameIndex,
          0.08 // Slightly tweaked for a heavier, more cinematic feel
        );

        const drawFrameIndex = Math.round(currentRenderFrameRef.current);
        const img = loaderRef.current.getFrame(drawFrameIndex);

        if (img) {
          const { offsetX, offsetY, drawWidth, drawHeight } = renderBoundsRef.current;
          
          // Clear and draw using the cached 'cover' bounds
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        }

        if (IS_DEV) {
          setDevDiagnostics({
            current: drawFrameIndex,
            target: targetInt,
            progress: scrollProgressRef.current
          });
        }

        requestRef.current = requestAnimationFrame(render);
      };

      requestRef.current = requestAnimationFrame(render);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    };

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [scrollProgressRef, IS_DEV]);

  // Handle Canvas Resizing correctly
  useEffect(() => {
    const resizeCanvas = () => {
      if (!canvasRef.current) return;
      
      // Clamp DPR to max 2 to prevent massive memory usage on super-retina displays
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      canvasRef.current.width = width * dpr;
      canvasRef.current.height = height * dpr;
      
      // Calculate "cover" algorithm bounds ONCE per resize
      const canvasRatio = canvasRef.current.width / canvasRef.current.height;
      const imgRatio = ORIGINAL_WIDTH / ORIGINAL_HEIGHT;
      
      let drawWidth = canvasRef.current.width;
      let drawHeight = canvasRef.current.height;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        // Canvas is wider than image aspect ratio, fit width
        drawHeight = canvasRef.current.width / imgRatio;
        offsetY = (canvasRef.current.height - drawHeight) / 2;
      } else {
        // Canvas is taller than image aspect ratio, fit height
        drawWidth = canvasRef.current.height * imgRatio;
        offsetX = (canvasRef.current.width - drawWidth) / 2;
      }
      
      renderBoundsRef.current = { offsetX, offsetY, drawWidth, drawHeight };
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial size

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <>
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          opacity: isReady ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out',
          backgroundColor: '#050505'
        }}
      />
      
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
      
      {/* Development Diagnostics Overlay */}
      {IS_DEV && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: '#00ff00',
          padding: '10px',
          fontFamily: 'monospace',
          fontSize: '10px',
          zIndex: 9999,
          pointerEvents: 'none',
          borderRadius: '4px'
        }}>
          <div>FRAME: {devDiagnostics.current} / {TOTAL_FRAMES - 1}</div>
          <div>TARGET: {devDiagnostics.target}</div>
          <div>SCROLL: {(devDiagnostics.progress * 100).toFixed(1)}%</div>
        </div>
      )}
    </>
  );
};
