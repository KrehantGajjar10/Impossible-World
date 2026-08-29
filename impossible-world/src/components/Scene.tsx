import { Canvas } from '@react-three/fiber';
import { World } from './world/World';
import { CinematicCamera } from './camera/CinematicCamera';

export const Scene = () => {
  return (
    <Canvas
      shadows
      dpr={[1, 2]} // Support high-dpi displays safely
    >
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 15, 60]} />
      
      <CinematicCamera />
      <World />
    </Canvas>
  );
};
