// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VoidArchitecture = (props: any) => {
  return (
    <group {...props}>
      {/* Floating Floor */}
      <mesh position={[0, -2, 0]} receiveShadow>
        <boxGeometry args={[8, 1, 30]} />
        <meshPhysicalMaterial color="#050505" roughness={0.2} metalness={0.9} clearcoat={0.8} clearcoatRoughness={0.2} />
      </mesh>
      
      {/* Floating Disconnected Arches */}
      {[...Array(5)].map((_, i) => (
        <group key={i} position={[0, 4, -i * 6]} rotation={[0, 0, (i % 2 === 0 ? 0.05 : -0.05)]}>
           {/* Left Pillar */}
           <mesh position={[-5, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1, 12, 1]} />
              <meshStandardMaterial color="#1a0000" roughness={0.2} metalness={0.9} />
           </mesh>
           {/* Right Pillar */}
           <mesh position={[5, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1, 12, 1]} />
              <meshStandardMaterial color="#1a0000" roughness={0.2} metalness={0.9} />
           </mesh>
           {/* Top Beam */}
           <mesh position={[0, 6.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[11, 1, 1]} />
              <meshStandardMaterial color="#2a0000" roughness={0.2} metalness={0.9} />
           </mesh>
        </group>
      ))}
    </group>
  );
};
