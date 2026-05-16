'use client';

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Stars, PerspectiveCamera, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

interface NyraSacredCoreProps {
  onModuleClick?: (module: string) => void;
  className?: string;
}

const MODULES = [
  { name: 'TwentyCRM', color: '#6366f1' },
  { name: 'Activepieces', color: '#14b8a6' },
  { name: 'Nexus Router', color: '#6366f1' },
  { name: 'OpenClaw', color: '#ec4899' },
  { name: 'NerveUI', color: '#14b8a6' },
  { name: 'Memory', color: '#6366f1' },
  { name: 'Quote API', color: '#14b8a6' },
];

function MerKaBa({ color1 = "#6366f1", color2 = "#ec4899" }) {
  const ref1 = useRef<THREE.Mesh>(null);
  const ref2 = useRef<THREE.Mesh>(null);
  const tesseractRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref1.current) {
      ref1.current.rotation.y = t * 0.5;
      ref1.current.rotation.z = t * 0.2;
    }
    if (ref2.current) {
      ref2.current.rotation.y = -t * 0.5;
      ref2.current.rotation.z = -t * 0.2;
    }
    if (tesseractRef.current) {
      // Tesseract materializes briefly every 10 seconds
      const cycle = Math.sin(t * 0.6);
      tesseractRef.current.visible = cycle > 0.8;
      tesseractRef.current.rotation.x = t * 0.3;
      tesseractRef.current.rotation.y = t * 0.3;
      tesseractRef.current.scale.setScalar(1.5 + cycle * 0.2);
    }
  });

  return (
    <group>
      {/* Tesseract Wireframe (Subtle Materialization) */}
      <mesh ref={tesseractRef}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color="#6366f1" wireframe transparent opacity={0.1} />
      </mesh>
      {/* Upper Tetrahedron */}
      <mesh ref={ref1}>
        <tetrahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color1} wireframe transparent opacity={0.8} />
      </mesh>
      {/* Lower Tetrahedron */}
      <mesh ref={ref2} rotation={[Math.PI, 0, 0]}>
        <tetrahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color2} wireframe transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function DataParticles({ count = 50 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 10;
      p[i * 3 + 1] = (Math.random() - 0.5) * 10;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return p;
  }, [count]);

  const ref = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const positions = ref.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      // Move toward center
      positions[ix] *= 0.99;
      positions[iy] *= 0.99;
      positions[iz] *= 0.99;

      // Reset if too close
      if (Math.abs(positions[ix]) < 0.1) {
        positions[ix] = (Math.random() - 0.5) * 10;
        positions[iy] = (Math.random() - 0.5) * 10;
        positions[iz] = (Math.random() - 0.5) * 10;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          args={[points, 3]}
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#14b8a6" transparent opacity={0.6} />
    </points>
  );
}

export function NyraSacredCore({ onModuleClick, className }: NyraSacredCoreProps) {
  return (
    <div className={cn("relative w-full h-[500px] bg-black/20 rounded-[48px] overflow-hidden border border-border/30 shadow-2xl", className)}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#ec4899" />

        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
             <MerKaBa />
          </Float>
          <DataParticles />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </Suspense>

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      {/* Module Labels Overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-full h-full">
           {MODULES.map((mod, i) => {
             const angle = (i / MODULES.length) * Math.PI * 2;
             const x = 50 + Math.cos(angle) * 35;
             const y = 50 + Math.sin(angle) * 35;
             return (
               <button
                 key={mod.name}
                 className="absolute pointer-events-auto p-2 rounded-xl bg-background/40 border border-border/50 backdrop-blur-md text-[9px] font-black uppercase tracking-widest text-foreground hover:bg-indigo-600 hover:text-white transition-all shadow-xl"
                 style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                 onClick={() => onModuleClick?.(mod.name)}
               >
                 {mod.name}
               </button>
             )
           })}
        </div>
      </div>
    </div>
  );
}
