import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ImpossibleLandmark } from '../architecture/ImpossibleLandmark';
import { InteractiveArtifact } from './InteractiveArtifact';
import { VoidArchitecture } from '../architecture/VoidArchitecture';
import { AtmosphericParticles } from './AtmosphericParticles';
import { journeyState } from '../journey/journeyState';

export const World = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Memoize colors to prevent re-instantiation
  const startColor = useMemo(() => new THREE.Color('#050505'), []);
  const endColor = useMemo(() => new THREE.Color('#1a0505'), []);

  // Subtle rotation, mouse parallax, and portal transition
  useFrame(({ clock, pointer, scene }) => {
    // 1. Phase 9 Portal Transition
    const progress = journeyState.progress;
    // Fade into the void dimension after passing the gateway (progress 0.5 -> 1.0)
    const portalProgress = Math.max(0, Math.min(1, (progress - 0.5) * 2));
    
    const targetColor = startColor.clone().lerp(endColor, portalProgress);
    scene.background = targetColor;
    if (scene.fog) {
      scene.fog.color = targetColor;
    }

    // 2. Parallax and Breathing
    if (groupRef.current) {
      const baseRotY = Math.sin(clock.elapsedTime * 0.1) * 0.05; 
      
      const targetRotX = pointer.y * -0.05;
      const targetRotY = baseRotY + (pointer.x * 0.05);

      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05);
    }
  });

  return (
    <>
      <fog attach="fog" args={['#050505', 5, 35]} />
      {/* Lighting */}
      <ambientLight intensity={0.15} color="#ffffff" />
      <directionalLight
        position={[10, 20, 10]}
        intensity={4.0}
        color="#cceeff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight
        position={[-10, -5, -10]}
        intensity={2.0}
        color="#aa44ff"
      />

      {/* Atmospheric Particles */}
      <AtmosphericParticles />

      {/* Environment */}
      <group ref={groupRef}>
        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[150, 150]} />
          <meshPhysicalMaterial 
            color="#080808" 
            roughness={0.4} 
            metalness={0.8} 
            clearcoat={0.5} 
            clearcoatRoughness={0.3} 
          />
        </mesh>

        {/* Phase 8: Interactive Artifact */}
        <InteractiveArtifact position={[-2, 3, -6]} />

        {/* Framing Monolith 1 (Right) */}
        <mesh position={[6, 8, -5]} castShadow receiveShadow>
          <boxGeometry args={[2, 20, 2]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Framing Monolith 2 (Left depth) */}
        <mesh position={[-6, 12, -8]} castShadow receiveShadow>
          <boxGeometry args={[3, 28, 3]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Phase 5: Impossible Gateway Landmark */}
        <ImpossibleLandmark position={[-8, 6, -15]} rotation={[0, Math.PI / 6, 0]} />

        {/* Phase 9: Void Architecture */}
        <VoidArchitecture position={[-15, 6, -30]} rotation={[0, -Math.PI / 8, 0]} />
      </group>
    </>
  );
};


