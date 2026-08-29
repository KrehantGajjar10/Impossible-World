import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { journeyState } from '../journey/journeyState';

// Define the camera journey waypoints through the existing geometry
const WAYPOINTS = [
  { pos: new THREE.Vector3(0, 2, 10), look: new THREE.Vector3(0, 2, -5) },    // Start: Looking at central monolith
  { pos: new THREE.Vector3(0, 3, 0), look: new THREE.Vector3(-2, 4, -10) },   // Approach: Passing monolith, looking left
  { pos: new THREE.Vector3(-3, 4, -8), look: new THREE.Vector3(-8, 5, -15) }, // Deepen: Moving towards distant architecture
  { pos: new THREE.Vector3(-5, 5, -12), look: new THREE.Vector3(-10, 8, -25) } // End: Looking at the furthest structure
];

export const CinematicCamera = () => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(({ clock, pointer }) => {
    if (!cameraRef.current) return;
    
    // 1. Calculate target from scroll progress
    const progress = journeyState.progress;
    
    // Determine which segment we are in
    const segments = WAYPOINTS.length - 1;
    const scaledProgress = progress * segments;
    const currentIndex = Math.min(Math.floor(scaledProgress), segments - 1);
    const nextIndex = currentIndex + 1;
    
    // Local progress within the current segment (0 to 1)
    const localProgress = scaledProgress - currentIndex;

    const startWaypoint = WAYPOINTS[currentIndex];
    const endWaypoint = WAYPOINTS[nextIndex];

    // Interpolate base position and look target
    const targetBasePos = new THREE.Vector3().lerpVectors(startWaypoint.pos, endWaypoint.pos, localProgress);
    const targetLookAt = new THREE.Vector3().lerpVectors(startWaypoint.look, endWaypoint.look, localProgress);

    // 2. Add subtle cinematic sway (time-based) + mouse parallax
    const time = clock.elapsedTime;
    const swayX = Math.sin(time * 0.3) * 0.3;
    const swayY = Math.cos(time * 0.4) * 0.2;
    
    // Invert pointer slightly for a natural "head turn" perspective
    const parallaxX = pointer.x * -1.5;
    const parallaxY = pointer.y * -1.0;
    
    const finalTargetPos = targetBasePos.clone().add(new THREE.Vector3(swayX + parallaxX, swayY + parallaxY, 0));

    // 3. Smooth position interpolation (damping)
    // Using a slightly higher lerp factor than previous phase so it responds well to scrolling
    cameraRef.current.position.lerp(finalTargetPos, 0.05);

    // 4. Smooth rotation interpolation (damping towards target LookAt)
    const dummy = new THREE.Object3D();
    dummy.position.copy(cameraRef.current.position);
    dummy.lookAt(targetLookAt);

    cameraRef.current.quaternion.slerp(dummy.quaternion, 0.05);
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
