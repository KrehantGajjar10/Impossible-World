import { CinematicCanvas } from './components/cinematic/CinematicCanvas';
import './index.css'; // ensure styles are loaded

function App() {
  return (
    <>
      <CinematicCanvas />
      
      {/* 
        This is the invisible container that forces the page to be scrollable.
        1000vh provides a long enough scroll distance for the 10 second cinematic 
        to feel substantial and controlled. 
      */}
      <div 
        className="scroll-container" 
        style={{ 
          height: '1000vh',
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none' // allow clicks to pass through if needed
        }}
      />
    </>
  );
}

export default App;
