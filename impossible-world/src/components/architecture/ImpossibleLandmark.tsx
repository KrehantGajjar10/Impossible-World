import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { journeyState } from '../journey/journeyState';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ImpossibleLandmark = (props: any) => {
  const innerFrameRef = useRef<THREE.Group>(null);
  const coreFrameRef = useRef<THREE.Group>(null);

  // Base impossible rotations (from Phase 5)
  const innerBaseRotation = new THREE.Euler(Math.PI / 2, 0, Math.PI / 4);
  const coreBaseRotation = new THREE.Euler(Math.PI / 4, Math.PI / 2, 0);

  useFrame(() => {
    if (!innerFrameRef.current || !coreFrameRef.current) return;

    const progress = journeyState.progress;
    
    // The landmark is at the end of the journey, so the transformation 
    // should become most dramatic as progress goes from 0.5 to 1.0.
    const influence = Math.max(0, (progress - 0.5) * 2);

    // Calculate target rotations: twist significantly as you approach
    const innerTargetEuler = new THREE.Euler(
      innerBaseRotation.x + (Math.PI * influence),
      innerBaseRotation.y,
      innerBaseRotation.z - (Math.PI * 0.5 * influence)
    );

    const coreTargetEuler = new THREE.Euler(
      coreBaseRotation.x - (Math.PI * 1.5 * influence),
      coreBaseRotation.y + (Math.PI * influence),
      coreBaseRotation.z
    );

    const innerTargetQuat = new THREE.Quaternion().setFromEuler(innerTargetEuler);
    const coreTargetQuat = new THREE.Quaternion().setFromEuler(coreTargetEuler);

    // Smoothly interpolate (dampen) the rotations so it feels heavy and majestic
    innerFrameRef.current.quaternion.slerp(innerTargetQuat, 0.05);
    coreFrameRef.current.quaternion.slerp(coreTargetQuat, 0.05);
  });

  return (
    <group {...props}>
      {/* Outer Frame (Normal orientation) */}
      <group>
        <mesh position={[0, 8, 0]} castShadow receiveShadow>
          <boxGeometry args={[16, 2, 4]} />
          <meshStandardMaterial color="#222222" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, -8, 0]} castShadow receiveShadow>
          <boxGeometry args={[16, 2, 4]} />
          <meshStandardMaterial color="#222222" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[-7, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 14, 4]} />
          <meshStandardMaterial color="#222222" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[7, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 14, 4]} />
          <meshStandardMaterial color="#222222" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>

      {/* Inner Frame (Dynamic Scroll Rotation) */}
      <group ref={innerFrameRef} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
        <mesh position={[0, 6, 0]} castShadow receiveShadow>
          <boxGeometry args={[12, 1.5, 3]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, -6, 0]} castShadow receiveShadow>
          <boxGeometry args={[12, 1.5, 3]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[-5.25, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 10.5, 3]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[5.25, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 10.5, 3]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
      
      {/* Core Frame (Dynamic Scroll Rotation) */}
      <group ref={coreFrameRef} rotation={[Math.PI / 4, Math.PI / 2, 0]}>
        <mesh position={[0, 4, 0]} castShadow receiveShadow>
          <boxGeometry args={[8, 1, 2]} />
          <meshStandardMaterial color="#333333" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[0, -4, 0]} castShadow receiveShadow>
          <boxGeometry args={[8, 1, 2]} />
          <meshStandardMaterial color="#333333" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[-3.5, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 7, 2]} />
          <meshStandardMaterial color="#333333" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[3.5, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 7, 2]} />
          <meshStandardMaterial color="#333333" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
};
