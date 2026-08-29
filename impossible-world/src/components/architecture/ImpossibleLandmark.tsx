// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ImpossibleLandmark = (props: any) => {
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

      {/* Inner Frame (Impossibly rotated 90 degrees around X and Z) */}
      <group rotation={[Math.PI / 2, 0, Math.PI / 4]}>
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
      
      {/* Core Frame (Impossibly rotated inside the inner frame) */}
      <group rotation={[Math.PI / 4, Math.PI / 2, 0]}>
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
