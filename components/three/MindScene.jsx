"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useState, useEffect } from "react";

// === orbiting dots ===
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
      <sphereGeometry args={[0.2, 16, 10]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

// ==== InteractiveSphere core ====
function NodeSystem() {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // base rotation
    groupRef.current.rotation.y += delta * (hovered ? 1.2 : 0.7);

    // slight float up/down so it feels alive
    const t = state.clock.getElapsedTime();
    const floatY = Math.sin(t * 0.8) * 0.25;
    groupRef.current.position.y = floatY;

    // smooth scale on hover (very subtle)
    const targetScale = hovered ? 1.05 : 30; //yeha
    const currentScale = groupRef.current.scale.x || 1;
    const next = THREE.MathUtils.lerp(currentScale, targetScale, delta * 6);
    groupRef.current.scale.set(next, next, next);
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* soft glow halo behind everything */}
      <mesh position={[0, 0, -2]}>
        <circleGeometry args={[4.1, 64]} />
        <meshBasicMaterial
          color="#ff2b7f"
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0, -1.8]}>
        <circleGeometry args={[5.6, 64]} />
        <meshBasicMaterial
          color="#4afba7"
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>

      {/* central wireframe globe (unchanged colors) */}
      <mesh>
        <sphereGeometry args={[2, 28, 28]} />
        <meshBasicMaterial color="#9efcff" wireframe />
      </mesh>

      {/* ring 1 - pink */}
      <mesh rotation={[0.4, 0.0, 0.0]}>
        <torusGeometry args={[2.7, 0.05, 16, 80]} />
        <meshBasicMaterial color="#ff2b7f" />
      </mesh>

      {/* ring 2 - green */}
      <mesh rotation={[0.0, 0.5, 0.7]}>
        <torusGeometry args={[3.0, 0.04, 16, 80]} />
        <meshBasicMaterial color="#4afba7" />
      </mesh>

      {/* small orbiting dots */}
      <OrbitingDot radius={3.3} speed={0.8} phase={0} color="#7df3ff" />
      <OrbitingDot
        radius={3.6}
        speed={1.0}
        phase={Math.PI / 2}
        color="#ff8ce6"
      />
    </group>
  );
}

// === hero scene with zoom on focus ===
function HeroCore({ focus }) {
  const { camera } = useThree();
  const animRef = useRef(null);

  useEffect(() => {
    const from = camera.position.clone();
    const to = focus
      ? new THREE.Vector3(0, 0, 7.5)
      : new THREE.Vector3(0, 0, 18);
    animRef.current = { from, to, t: 0 };
  }, [focus, camera]);

  useFrame((_, dt) => {
    if (!animRef.current) return;
    animRef.current.t += dt * 0.8;
    const k = Math.min(1, animRef.current.t);
    camera.position.lerpVectors(
      animRef.current.from,
      animRef.current.to,
      k
    );
    camera.lookAt(0, 0, 0);
    if (k >= 1) animRef.current = null;
  });

  return (
    <>
      <color attach="background" args={["#02030a"]} />
      <Stars count={2600} factor={3} fade speed={0.9} />
      <ambientLight intensity={1.3} />
      <pointLight position={[8, 10, 10]} intensity={1.6} color={"#ff66ff"} />
      <NodeSystem />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate
        target={[0, 0, 0]}
        makeDefault
      />
    </>
  );
}

export default function MindScene({ mode = "HERO", focus = false }) {
  return (
    <Canvas camera={{ position: [100, 90, 50], fov: 70 }} dpr={[5, 2]}>
      <HeroCore focus={focus} />
    </Canvas>
  );
}
