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
        className="audio-toggle"
        onClick={toggleAudio}
      >
        {isMuted ? 'Unmute Audio' : 'Mute Audio'}
      </button>
    </>
  );
};

export default App;
