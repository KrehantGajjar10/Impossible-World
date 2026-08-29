import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ImpossibleLandmark } from '../architecture/ImpossibleLandmark';
import { InteractiveArtifact } from './InteractiveArtifact';

export const World = () => {
  const groupRef = useRef<THREE.Group>(null);

  // Subtle rotation and mouse parallax to give life to the scene
  useFrame(({ clock, pointer }) => {
    if (groupRef.current) {
      const baseRotY = Math.sin(clock.elapsedTime * 0.1) * 0.05; // Slowed down slightly to emphasize monumentality
      
      // Pointer offset target
      const targetRotX = pointer.y * -0.05;
      const targetRotY = baseRotY + (pointer.x * 0.05);

      // Smooth lerp towards target
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05);
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} color="#ffffff" />
      <directionalLight
        position={[10, 20, 10]}
        intensity={3.0}
        color="#cceeff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight
        position={[-10, -5, -10]}
        intensity={1.5}
        color="#aa44ff"
      />

      {/* Environment */}
      <group ref={groupRef}>
        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[150, 150]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} metalness={0.1} />
        </mesh>

        {/* Phase 8: Interactive Artifact */}
        <InteractiveArtifact position={[-2, 3, -6]} />

        {/* Framing Monolith 1 (Right) */}
        <mesh position={[6, 8, -5]} castShadow receiveShadow>
          <boxGeometry args={[2, 20, 2]} />
          <meshStandardMaterial color="#222222" roughness={0.2} metalness={0.6} />
        </mesh>

        {/* Framing Monolith 2 (Left depth) */}
        <mesh position={[-6, 12, -8]} castShadow receiveShadow>
          <boxGeometry args={[3, 28, 3]} />
          <meshStandardMaterial color="#2b2b2b" roughness={0.4} metalness={0.5} />
        </mesh>

        {/* Phase 5: Impossible Gateway Landmark */}
        <ImpossibleLandmark position={[-8, 6, -15]} rotation={[0, Math.PI / 6, 0]} />
      </group>
    </>
  );
};


