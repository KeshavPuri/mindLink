"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useMemo } from "react";

// ── Keyword → theme classifier ───────────────────────────────────────
function classifyQuery(query) {
  const q = query.toLowerCase();

  const is = (words) => words.some((w) => q.includes(w));

  if (is(["black hole", "galaxy", "space", "cosmos", "star", "universe", "nebula", "cosmology", "nasa", "planet", "solar", "asteroid", "dark matter"]))
    return "space";
  if (is(["dna", "biology", "brain", "neuron", "consciousness", "evolution", "cell", "gene", "protein", "organism", "life", "human body", "genome"]))
    return "biology";
  if (is(["ai", "artificial intelligence", "machine learning", "quantum", "computer", "algorithm", "neural network", "robot", "cyber", "digital", "code", "programming", "software", "technology", "future"]))
    return "cyber";
  if (is(["war", "conflict", "weapon", "military", "nuclear", "bomb", "battle", "army", "violence", "collapse", "crisis"]))
    return "war";
  if (is(["philosophy", "consciousness", "meaning", "soul", "religion", "god", "existence", "reality", "time", "death", "meditation"]))
    return "cosmos";
  if (is(["climate", "ocean", "nature", "earth", "environment", "energy", "sun", "forest", "ecology"]))
    return "nature";

  return "default";
}

// ── Theme configs ────────────────────────────────────────────────────
const THEMES = {
  default:  { bg: "#020408", p1: "#94a3b8", p2: "#475569", rotSpeed: 0.12, speedMult: 1.0,  camSpeed: 1.0, starCount: 2000, starFactor: 2.5 },
  space:    { bg: "#010212", p1: "#60a5fa", p2: "#818cf8", rotSpeed: 0.08, speedMult: 0.6,  camSpeed: 0.6, starCount: 3500, starFactor: 4.0 },
  biology:  { bg: "#010a04", p1: "#4ade80", p2: "#86efac", rotSpeed: 0.20, speedMult: 1.8,  camSpeed: 1.2, starCount: 1200, starFactor: 1.8 },
  cyber:    { bg: "#010810", p1: "#22d3ee", p2: "#0ea5e9", rotSpeed: 0.45, speedMult: 3.0,  camSpeed: 2.0, starCount: 1800, starFactor: 2.0 },
  war:      { bg: "#0f0101", p1: "#ef4444", p2: "#7f1d1d", rotSpeed: 0.35, speedMult: 2.5,  camSpeed: 2.5, starCount: 800,  starFactor: 1.5 },
  cosmos:   { bg: "#04010f", p1: "#a78bfa", p2: "#7c3aed", rotSpeed: 0.06, speedMult: 0.4,  camSpeed: 0.5, starCount: 2800, starFactor: 3.5 },
  nature:   { bg: "#010801", p1: "#34d399", p2: "#059669", rotSpeed: 0.10, speedMult: 0.8,  camSpeed: 0.8, starCount: 1500, starFactor: 2.0 },
};

function getTheme(query) {
  return THEMES[classifyQuery(query)] || THEMES.default;
}

// ── Background ────────────────────────────────────────────────────────
function BackgroundController({ query }) {
  const { scene } = useThree();
  const current = useRef(new THREE.Color("#020408"));

  useFrame(() => {
    const target = new THREE.Color(getTheme(query).bg);
    current.current.lerp(target, 0.03);
    scene.background = current.current.clone();
  });

  return null;
}

// ── Reactive lights ───────────────────────────────────────────────────
function ReactiveLights({ query }) {
  const l1 = useRef();
  const l2 = useRef();
  const amb = useRef();

  useFrame(() => {
    const theme = getTheme(query);
    if (l1.current)  l1.current.color.lerp(new THREE.Color(theme.p1), 0.03);
    if (l2.current)  l2.current.color.lerp(new THREE.Color(theme.p2), 0.03);
    if (amb.current) {
      amb.current.intensity = THREE.MathUtils.lerp(amb.current.intensity, 0.5, 0.03);
    }
  });

  return (
    <>
      <ambientLight ref={amb} intensity={0.5} />
      <pointLight ref={l1} position={[6, 8, 4]}   intensity={2.0} color="#94a3b8" />
      <pointLight ref={l2} position={[-8, -4, -6]} intensity={1.2} color="#475569" />
    </>
  );
}

// ── Drifting particles ────────────────────────────────────────────────
function DriftingParticles({ count = 140, colorKey = "p1", query }) {
  const mesh    = useRef();
  const mat     = useRef();
  const curSpd  = useRef(1.0);

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      vel[i * 3]     = (Math.random() - 0.5) * 0.008;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.008;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.008;
    }
    return [pos, vel];
  }, [count]);

  useFrame(() => {
    if (!mesh.current || !mat.current) return;
    const theme = getTheme(query);
    curSpd.current = THREE.MathUtils.lerp(curSpd.current, theme.speedMult, 0.025);

    const pos = mesh.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3]     += velocities[i * 3]     * curSpd.current;
      pos[i * 3 + 1] += velocities[i * 3 + 1] * curSpd.current;
      pos[i * 3 + 2] += velocities[i * 3 + 2] * curSpd.current;
      if (Math.abs(pos[i * 3])     > 20) pos[i * 3]     *= -0.9;
      if (Math.abs(pos[i * 3 + 1]) > 20) pos[i * 3 + 1] *= -0.9;
      if (Math.abs(pos[i * 3 + 2]) > 20) pos[i * 3 + 2] *= -0.9;
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
    mat.current.color.lerp(new THREE.Color(theme[colorKey]), 0.03);
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial ref={mat} color="#94a3b8" size={0.10} transparent opacity={0.75} sizeAttenuation />
    </points>
  );
}

// ── Central quantum core ──────────────────────────────────────────────
function QuantumCore({ query }) {
  const groupRef   = useRef();
 const ring1MeshRef = useRef();
const ring2MeshRef = useRef();
const ring1MatRef  = useRef();
const ring2MatRef  = useRef();
const ring3MatRef  = useRef();
const glowRef      = useRef();
const wireRef      = useRef();
  const curRot     = useRef(0.12);

useFrame((state, delta) => {
  if (!groupRef.current) return;
  const theme = getTheme(query);
  curRot.current = THREE.MathUtils.lerp(curRot.current, theme.rotSpeed, 0.025);

  groupRef.current.rotation.y += delta * curRot.current;
  groupRef.current.rotation.x += delta * (curRot.current * 0.3);
  const t = state.clock.getElapsedTime();
  groupRef.current.position.y = Math.sin(t * 0.35) * 0.25;

  const p1 = new THREE.Color(theme.p1);
  const p2 = new THREE.Color(theme.p2);

  if (ring1MeshRef.current) ring1MeshRef.current.rotation.z += delta * curRot.current * 1.5;
  if (ring2MeshRef.current) ring2MeshRef.current.rotation.x += delta * curRot.current * 2.0;
  if (ring1MatRef.current)  ring1MatRef.current.color.lerp(p1, 0.03);
  if (ring2MatRef.current)  ring2MatRef.current.color.lerp(p2, 0.03);
  if (ring3MatRef.current)  ring3MatRef.current.color.lerp(p1, 0.03);
  if (glowRef.current)      glowRef.current.color.lerp(p1, 0.03);
  if (wireRef.current)      wireRef.current.color.lerp(p1, 0.03);
});
  return (
    <group ref={groupRef}>
      {/* Center glow */}
      <mesh>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshBasicMaterial ref={glowRef} color="#94a3b8" transparent opacity={0.12} />
      </mesh>

      {/* Wireframe sphere */}
      <mesh>
        <sphereGeometry args={[1.4, 18, 18]} />
        <meshBasicMaterial ref={wireRef} color="#94a3b8" wireframe transparent opacity={0.30} />
      </mesh>

      {/* Ring 1 — horizontal */}
     
<mesh ref={ring1MeshRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.4, 0.05, 16, 80]} />
       <meshBasicMaterial ref={ring2MatRef} color="#475569" transparent opacity={0.45} />
      </mesh>

    
    {/* Ring 2 — tilted */}
<mesh ref={ring2MeshRef} rotation={[0.6, 0.4, 0]}>
        <torusGeometry args={[2.9, 0.035, 16, 80]} />
        <meshBasicMaterial ref={ring2MatRef} color="#475569" transparent opacity={0.45} />
      </mesh>

      {/* Ring 3 — counter tilt */}
      <mesh rotation={[1.1, 0, 0.9]}>
        <torusGeometry args={[3.4, 0.025, 16, 80]} />
        <meshBasicMaterial ref={ring3MatRef} color="#94a3b8" transparent opacity={0.30} />
      </mesh>

      {/* Outer halo */}
      <mesh>
        <sphereGeometry args={[4.0, 32, 32]} />
        <meshBasicMaterial color="#94a3b8" transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

// ── Cinematic camera ──────────────────────────────────────────────────
function CameraDrift({ query }) {
  const { camera } = useThree();
  const curSpd = useRef(1.0);

  useFrame((state) => {
    const theme = getTheme(query);
    curSpd.current = THREE.MathUtils.lerp(curSpd.current, theme.camSpeed, 0.02);
    const t = state.clock.getElapsedTime();
    camera.position.x = Math.sin(t * 0.09 * curSpd.current) * 2.5;
    camera.position.y = Math.cos(t * 0.07 * curSpd.current) * 1.2;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ── Full scene ────────────────────────────────────────────────────────
function QuantumCore3D({ query }) {
  const theme = getTheme(query);
  return (
    <>
      <BackgroundController query={query} />
      <Stars count={theme.starCount} factor={theme.starFactor} fade speed={0.3} />
      <ReactiveLights query={query} />
      <DriftingParticles count={160} colorKey="p1" query={query} />
      <DriftingParticles count={80}  colorKey="p2" query={query} />
      <QuantumCore query={query} />
      <CameraDrift query={query} />
    </>
  );
}

export default function QuantumScene({ query = "" }) {
  return (
    <Canvas camera={{ position: [0, 0, 11], fov: 65 }} dpr={[1, 2]}>
      <QuantumCore3D query={query} />
    </Canvas>
  );
}