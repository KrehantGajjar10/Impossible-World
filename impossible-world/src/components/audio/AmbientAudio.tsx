import { useFrame } from '@react-three/fiber';
import { audioEngine } from './AudioEngine';
import { journeyState } from '../journey/journeyState';

export const AmbientAudio = () => {
  useFrame(() => {
    audioEngine.updateAtmosphere(journeyState.progress);
  });
  return null;
};
