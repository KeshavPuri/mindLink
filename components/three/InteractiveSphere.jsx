"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useState } from "react";

// Central wireframe sphere + rings + small orbiters
function NodeSystem() {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // Slow rotation, hover par thoda fast
    groupRef.current.rotation.y += delta * (hovered ? 1.2 : 0.5);
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Central wireframe globe */}
      <mesh>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color="#9efcff" wireframe />
      </mesh>

      {/* Ring 1 - Pink */}
      <mesh rotation={[0.4, 0.0, 0.0]}>
        <torusGeometry args={[1.35, 0.025, 16, 64]} />
        <meshBasicMaterial color="#ff2b7f" />
      </mesh>

      {/* Ring 2 - Green */}
      <mesh rotation={[0.0, 0.5, 0.7]}>
        <torusGeometry args={[1.45, 0.02, 16, 64]} />
        <meshBasicMaterial color="#4afba7" />
      </mesh>

      {/* Small orbiting dots */}
      <OrbitingDot radius={1.65} speed={0.7} phase={0} color="#7df3ff" />
      <OrbitingDot radius={1.9} speed={0.9} phase={Math.PI / 2} color="#ff8ce6" />
    </group>
  );
}

function OrbitingDot({ radius, speed, phase, color }) {
  const ref = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed + phase;
    const x = Math.cos(t) * radius;
    const y = Math.sin(t) * radius * 0.4;
    const z = Math.sin(t * 0.6) * 0.6;
    if (ref.current) {
      ref.current.position.set(x, y, z);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

export default function InteractiveSphere() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={1.4} />
      {/* Slight back light for glow depth */}
      <pointLight position={[3, 3, 4]} intensity={1.2} color={new THREE.Color("#ff66ff")} />
      <NodeSystem />
      {/* User can drag to rotate system */}
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </Canvas>
  );
}
