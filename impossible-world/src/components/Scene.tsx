import { Canvas } from '@react-three/fiber';
import { World } from './world/World';
import { CinematicCamera } from './camera/CinematicCamera';
import { AmbientAudio } from './audio/AmbientAudio';
import { CinematicEffects } from './effects/CinematicEffects';

export const Scene = () => {
  return (
    <Canvas
      shadows
      dpr={[1, 2]} // Support high-dpi displays safely
    >
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 15, 60]} />
      
      <AmbientAudio />
      <CinematicCamera />
      <World />
      <CinematicEffects />
    </Canvas>
  );
};
