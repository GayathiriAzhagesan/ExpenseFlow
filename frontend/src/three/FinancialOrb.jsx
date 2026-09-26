import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Torus } from '@react-three/drei';

function OrbMesh() {
  const sphereRef = useRef();
  const ringRef1 = useRef();
  const ringRef2 = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (sphereRef.current) {
      sphereRef.current.position.y = Math.sin(t * 1.2) * 0.15;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.x = t * 0.4;
      ringRef1.current.rotation.y = t * 0.6;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.x = -t * 0.5;
      ringRef2.current.rotation.z = t * 0.7;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={0.6}>
      <group>
        {/* Core Glowing Sphere */}
        <Sphere ref={sphereRef} args={[0.9, 32, 32]}>
          <meshStandardMaterial
            color="#6366F1"
            roughness={0.1}
            metalness={0.8}
            emissive="#4338CA"
            emissiveIntensity={0.6}
          />
        </Sphere>

        {/* Orbit Ring 1 */}
        <Torus ref={ringRef1} args={[1.4, 0.03, 16, 100]}>
          <meshBasicMaterial color="#06B6D4" wireframe={false} />
        </Torus>

        {/* Orbit Ring 2 */}
        <Torus ref={ringRef2} args={[1.7, 0.02, 16, 100]}>
          <meshBasicMaterial color="#A855F7" wireframe={false} />
        </Torus>
      </group>
    </Float>
  );
}

export default function FinancialOrb({ className = 'h-48 w-48' }) {
  return (
    <div className={`relative ${className} select-none pointer-events-none`}>
      <Canvas
        camera={{ position: [0, 0, 4.0], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.5} />
        <pointLight position={[3, 3, 3]} intensity={3} color="#06B6D4" />
        <pointLight position={[-3, -3, -3]} intensity={2} color="#A855F7" />
        <OrbMesh />
      </Canvas>
    </div>
  );
}
