import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { audioEngine } from '../audio/AudioEngine';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const InteractiveArtifact = (props: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Manage cursor state
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto'; // Ensure cleanup if unmounted
    };
  }, [hovered]);

  // Smoothly animate state changes
  useFrame((_state, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    // 1. Base floating rotation (speeds up if clicked)
    meshRef.current.rotation.x += delta * (clicked ? 1.5 : 0.2);
    meshRef.current.rotation.y += delta * (clicked ? 2.0 : 0.3);

    // 2. Determine target values based on state
    const targetScale = clicked ? 1.5 : (hovered ? 1.2 : 1.0);
    const targetEmissiveIntensity = clicked ? 4.0 : (hovered ? 0.8 : 0.0);
    
    // 3. Smooth interpolation towards targets
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    
    materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      materialRef.current.emissiveIntensity,
      targetEmissiveIntensity,
      0.1
    );
  });

  return (
    <mesh
      {...props}
      ref={meshRef}
      onPointerOver={(e) => {
        e.stopPropagation(); // Prevent raycast bleeding to objects behind
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (!clicked) {
          audioEngine.playArtifactPing();
        }
        setClicked(!clicked); // Toggle on/off
      }}
      castShadow
    >
      <octahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#222222"
        emissive="#00bfff"
        emissiveIntensity={0}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
};
