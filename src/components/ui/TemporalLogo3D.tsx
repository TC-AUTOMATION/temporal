'use client';

import { useRef, Suspense, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Center, Float, useTexture } from '@react-three/drei';
import * as THREE from 'three';

function Logo3D({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useTexture('/logo-3d.png');

  // Make texture transparent
  useEffect(() => {
    if (texture) {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
    }
  }, [texture]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  // Create multiple layers for 3D depth effect
  const layers = useMemo(() => {
    const count = 20; // Number of layers for depth
    const depth = 0.4; // Total depth
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        z: (i / count) * depth - depth / 2,
        opacity: i === 0 || i === count - 1 ? 1 : 0.95,
      });
    }
    return arr;
  }, []);

  const aspect = 146.01 / 181.41; // From SVG viewBox
  const planeWidth = 2.2 * aspect;
  const planeHeight = 2.2;

  return (
    <group ref={groupRef}>
      {/* Multiple stacked layers to create 3D depth */}
      {layers.map((layer, i) => (
        <mesh key={i} position={[0, 0, layer.z]}>
          <planeGeometry args={[planeWidth, planeHeight]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={layer.opacity}
            side={THREE.DoubleSide}
            depthWrite={i === 0 || i === layers.length - 1}
            alphaTest={0.1}
          />
        </mesh>
      ))}

      {/* Edge glow effect */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[planeWidth * 1.05, planeHeight * 1.05]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

interface TemporalLogo3DProps {
  size?: number;
  className?: string;
  color?: string;
}

export default function TemporalLogo3D({
  size = 400,
  className = '',
  color = '#8B5CF6'
}: TemporalLogo3DProps) {
  return (
    <div
      className={className}
      style={{ width: size, height: size }}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1} />
          <Float
            speed={2}
            rotationIntensity={0.1}
            floatIntensity={0.3}
          >
            <Center>
              <Logo3D color={color} />
            </Center>
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
}
