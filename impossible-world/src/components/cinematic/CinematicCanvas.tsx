import { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { FrameLoader } from './FrameLoader';
import { lerp } from '../../utils/math';

// From the manifest generated in Phase 1
const TOTAL_FRAMES = 240; 
const ORIGINAL_WIDTH = 1920;
const ORIGINAL_HEIGHT = 1080;

export const CinematicCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollProgressRef = useScrollProgress();
  
  // Track readiness
  const [isReady, setIsReady] = useState(false);
  
  // We use a ref for the frameLoader to persist it across re-renders
  const loaderRef = useRef<FrameLoader | null>(null);
  
  // To avoid jitter and give a cinematic weight, we interpolate the frame index
  const currentRenderFrameRef = useRef(0);
  
  // Animation frame ID for cleanup
  const requestRef = useRef<number>(null);

  useEffect(() => {
    // 1. Initialize Loader
    const loader = new FrameLoader(TOTAL_FRAMES);
    loaderRef.current = loader;
    
    // Preload first second of frames (24 frames) to ensure smooth startup
    loader.initialize(24).then(() => {
      setIsReady(true);
      // Start the render loop once initial batch is ready
      startRenderLoop();
    });

    // 2. The Render Loop
    const startRenderLoop = () => {
      const render = () => {
        if (!canvasRef.current || !loaderRef.current) return;
        
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Target frame based on scroll progress (0 to 1) -> (0 to 239)
        const maxFrameIndex = TOTAL_FRAMES - 1;
        const targetFrameIndex = scrollProgressRef.current * maxFrameIndex;
        
        // Lerp current frame towards target frame for cinematic smoothness (weight)
        // 0.1 is the easing factor. Lower = slower/heavier, Higher = faster/snappier
        currentRenderFrameRef.current = lerp(
          currentRenderFrameRef.current,
          targetFrameIndex,
          0.1 
        );

        // Round to nearest integer to get the actual frame to draw
        const drawFrameIndex = Math.round(currentRenderFrameRef.current);
        const img = loaderRef.current.getFrame(drawFrameIndex);

        if (img) {
          // Draw image to fill the canvas while maintaining aspect ratio (cover)
          const canvas = canvasRef.current;
          const canvasRatio = canvas.width / canvas.height;
          const imgRatio = ORIGINAL_WIDTH / ORIGINAL_HEIGHT;
          
          let drawWidth = canvas.width;
          let drawHeight = canvas.height;
          let offsetX = 0;
          let offsetY = 0;

          if (canvasRatio > imgRatio) {
            // Canvas is wider than image aspect ratio, fit width
            drawHeight = canvas.width / imgRatio;
            offsetY = (canvas.height - drawHeight) / 2;
          } else {
            // Canvas is taller than image aspect ratio, fit height
            drawWidth = canvas.height * imgRatio;
            offsetX = (canvas.width - drawWidth) / 2;
          }

          // Clear and draw
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        }

        // Loop
        requestRef.current = requestAnimationFrame(render);
      };

      // Start looping
      requestRef.current = requestAnimationFrame(render);
    };

    // Cleanup
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [scrollProgressRef]);

  // Handle Canvas Resizing to match window
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current) {
        // Use devicePixelRatio for crisp rendering on retina displays
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = window.innerWidth * dpr;
        canvasRef.current.height = window.innerHeight * dpr;
      }
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
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,
          opacity: isReady ? 1 : 0,
          transition: 'opacity 1s ease-in-out'
        }}
      />
      {!isReady && (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#050505',
          color: 'white',
          zIndex: 100,
          letterSpacing: '0.2em',
          fontSize: '12px'
        }}>
          INITIALIZING WORLD...
        </div>
      )}
    </>
  );
};
