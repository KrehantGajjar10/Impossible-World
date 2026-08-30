import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, DepthOfField, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { journeyState } from '../journey/journeyState';
import { BlendFunction } from 'postprocessing';

export const CinematicEffects = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dofRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const caRef = useRef<any>(null);

  const targetOffset = useMemo(() => new THREE.Vector2(0, 0), []);

  useFrame(() => {
    const progress = journeyState.progress;

    // Depth of Field: Focus on center early, then push focus deep into the void
    if (dofRef.current) {
      const baseDistance = 0.02;
      const targetDistance = baseDistance + (progress * 0.08);
      
      dofRef.current.focusDistance = THREE.MathUtils.lerp(
        dofRef.current.focusDistance || baseDistance,
        targetDistance,
        0.1
      );
    }

    // Chromatic Aberration: Peaks around 0.55 (gateway transition)
    if (caRef.current) {
      const distFromThreshold = Math.abs(progress - 0.55);
      // If within 0.15 of threshold (0.4 to 0.7), increase offset.
      let intensity = 0;
      if (distFromThreshold < 0.15) {
        intensity = (0.15 - distFromThreshold) * 0.05; 
      }
      
      targetOffset.set(intensity, intensity);
      if (caRef.current.offset) {
        caRef.current.offset.lerp(targetOffset, 0.1);
      }
    }
  });

  return (
    <EffectComposer multisampling={4}>
      <DepthOfField 
        ref={dofRef} 
        focusDistance={0.02} 
        focalLength={0.02} 
        bokehScale={2} 
        height={480} 
      />
      <Bloom 
        luminanceThreshold={1.2} 
        mipmapBlur 
        intensity={1.0} 
      />
      <ChromaticAberration 
        ref={caRef} 
        offset={new THREE.Vector2(0, 0)} 
        blendFunction={BlendFunction.NORMAL} 
      />
      <Vignette 
        eskil={false} 
        offset={0.1} 
        darkness={0.7} 
      />
    </EffectComposer>
  );
};
