import { Canvas } from '@react-three/fiber';
import { World } from './world/World';

export const Scene = () => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 2, 10], fov: 45, near: 0.1, far: 1000 }}
      dpr={[1, 2]} // Support high-dpi displays safely
    >
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 15, 60]} />
      
      <World />
    </Canvas>
  );
};
