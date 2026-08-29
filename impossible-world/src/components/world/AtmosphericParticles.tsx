import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { journeyState } from '../journey/journeyState';

export const AtmosphericParticles = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const particleCount = 1500;
  
  // Generate random positions over a large volume once
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;     // x: -30 to 30
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60; // y: -30 to 30
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80 - 15; // z: -55 to 25 (centered around the path)
    }
    return pos;
  }, []);

  const startColor = useMemo(() => new THREE.Color('#88ccff'), []); // Pale cyan
  const endColor = useMemo(() => new THREE.Color('#ff4444'), []);   // Deep crimson

  useFrame((_, delta) => {
    // 1. Slow cinematic drift
    if (pointsRef.current) {
      pointsRef.current.rotation.y -= delta * 0.02;
      pointsRef.current.rotation.x += delta * 0.01;
    }

    // 2. Synchronize color transition with the portal
    if (materialRef.current) {
      const progress = journeyState.progress;
      const portalProgress = Math.max(0, Math.min(1, (progress - 0.5) * 2));
      materialRef.current.color.copy(startColor).lerp(endColor, portalProgress);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.06}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
