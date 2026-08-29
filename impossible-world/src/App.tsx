import { useState } from 'react';
import { Scene } from './components/Scene';
import { ScrollTracker } from './components/journey/ScrollTracker';
import { audioEngine } from './components/audio/AudioEngine';
import { JourneyUI } from './components/ui/JourneyUI';

const App = () => {
  const [isMuted, setIsMuted] = useState(true);

  const toggleAudio = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <>
      <div className="canvas-container">
        <Scene />
      </div>
      <JourneyUI />
      <div className="scroll-container">
        <ScrollTracker />
      </div>
      <button 
        onClick={toggleAudio}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 100,
          background: 'rgba(20, 20, 20, 0.5)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.2)',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontFamily: 'monospace',
          backdropFilter: 'blur(4px)',
          textTransform: 'uppercase',
          fontSize: '12px'
        }}
      >
        {isMuted ? 'Unmute Audio' : 'Mute Audio'}
      </button>
    </>
  );
};

export default App;
