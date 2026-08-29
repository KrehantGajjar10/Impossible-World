import { Scene } from './components/Scene';
import { ScrollTracker } from './components/journey/ScrollTracker';

const App = () => {
  return (
    <>
      <div className="canvas-container">
        <Scene />
      </div>
      <div className="scroll-container">
        <ScrollTracker />
      </div>
    </>
  );
};

export default App;
