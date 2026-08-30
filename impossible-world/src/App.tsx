import { CinematicCanvas } from './components/cinematic/CinematicCanvas';
import { CinematicUI } from './components/ui/CinematicUI';
import { useScrollProgress } from './hooks/useScrollProgress';
import './index.css';

function App() {
  const { currentProgressRef } = useScrollProgress();

  return (
    <>
      <CinematicCanvas scrollProgressRef={currentProgressRef} />
      <CinematicUI scrollProgressRef={currentProgressRef} />
      
      <div 
        className="scroll-container" 
        style={{ 
          height: '1000vh',
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none'
        }}
      />
    </>
  );
}

export default App;
