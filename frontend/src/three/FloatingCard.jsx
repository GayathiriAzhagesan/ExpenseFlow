import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';

function CardMesh() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.25;
      meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.4) * 0.12;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <group ref={meshRef}>
        {/* Main Card Body */}
        <RoundedBox args={[3.2, 2.0, 0.08]} radius={0.12} smoothness={4}>
          <meshPhysicalMaterial
            color="#0b1329"
            metalness={0.9}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            reflectivity={0.9}
          />
        </RoundedBox>

        {/* Holographic Chip */}
        <mesh position={[-0.9, 0.2, 0.05]}>
          <planeGeometry args={[0.5, 0.4]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Glowing Accent Stripe */}
        <mesh position={[0.5, -0.4, 0.05]}>
          <planeGeometry args={[1.8, 0.12]} />
          <meshBasicMaterial color="#06b6d4" />
        </mesh>
      </group>
    </Float>
  );
}

export default function FloatingCard({ className = 'h-64 w-full' }) {
  return (
    <div className={`relative ${className} select-none pointer-events-none`}>
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={2.5} color="#818cf8" />
        <pointLight position={[-4, -3, 2]} intensity={2.0} color="#06b6d4" />
        <CardMesh />
      </Canvas>
    </div>
  );
}
