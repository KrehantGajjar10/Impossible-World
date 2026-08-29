import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

export const CinematicCamera = () => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(({ clock }) => {
    if (!cameraRef.current) return;
    
    const time = clock.elapsedTime;

    // Automatic test motion for Phase 3 (slowly drift forward)
    // In Phase 4, this target will be driven by scroll progress instead of time.
    const baseZ = 10 - (time * 0.5); 
    
    // Subtle cinematic sway
    const swayX = Math.sin(time * 0.3) * 0.3;
    const swayY = Math.cos(time * 0.4) * 0.2;
    
    const targetPosition = new THREE.Vector3(swayX, 2 + swayY, baseZ);

    // Smooth position interpolation (damping)
    cameraRef.current.position.lerp(targetPosition, 0.02);

    // Determine where to look
    // We look straight ahead, but slowly follow the forward progress
    const lookTarget = new THREE.Vector3(0, 2, baseZ - 15);

    // For smooth, cinematic rotation, we calculate the target rotation using a dummy object,
    // and then spherically interpolate (slerp) the camera's current rotation towards it.
    const dummy = new THREE.Object3D();
    dummy.position.copy(cameraRef.current.position);
    dummy.lookAt(lookTarget);

    cameraRef.current.quaternion.slerp(dummy.quaternion, 0.02);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={45}
      near={0.1}
      far={1000}
      position={[0, 2, 10]} // Initial starting position
    />
  );
};
