"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useMemo } from "react";

// ── Emotion → world config (DRAMATIC differences) ───────────────────
const THEMES = {
  default:   { bg: "#020108", primary: "#f59e0b", secondary: "#a78bfa", rotSpeed: 0.15, speedMult: 1.0,  camSpeed: 1.0, particleSize: 0.12, ambientIntensity: 0.4 },
  hopeful:   { bg: "#010510", primary: "#fbbf24", secondary: "#fde68a", rotSpeed: 0.18, speedMult: 1.2,  camSpeed: 1.0, particleSize: 0.16, ambientIntensity: 0.8 },
  ambitious: { bg: "#0a0020", primary: "#c084fc", secondary: "#7c3aed", rotSpeed: 0.55, speedMult: 3.0,  camSpeed: 2.2, particleSize: 0.18, ambientIntensity: 0.6 },
  peaceful:  { bg: "#001510", primary: "#2dd4bf", secondary: "#0891b2", rotSpeed: 0.04, speedMult: 0.15, camSpeed: 0.3, particleSize: 0.08, ambientIntensity: 1.2 },
  chaotic:   { bg: "#120400", primary: "#fb923c", secondary: "#fbbf24", rotSpeed: 1.20, speedMult: 8.0,  camSpeed: 5.0, particleSize: 0.22, ambientIntensity: 0.3 },
  dystopian: { bg: "#180000", primary: "#ef4444", secondary: "#450a0a", rotSpeed: 0.08, speedMult: 0.4,  camSpeed: 0.5, particleSize: 0.10, ambientIntensity: 0.1 },
  dangerous: { bg: "#200000", primary: "#dc2626", secondary: "#ff0000", rotSpeed: 0.90, speedMult: 5.5,  camSpeed: 3.5, particleSize: 0.20, ambientIntensity: 0.2 },
};

function getTheme(emotion) {
  return THEMES[emotion] || THEMES.default;
}

// ── Background lerp ──────────────────────────────────────────────────
function BackgroundController({ emotion }) {
  const { scene } = useThree();
  const current = useRef(new THREE.Color("#020108"));

  useFrame(() => {
    const target = new THREE.Color(getTheme(emotion).bg);
    current.current.lerp(target, 0.04);
    scene.background = current.current.clone();
  });

  return null;
}

// ── Reactive lights ──────────────────────────────────────────────────
function ReactiveLights({ emotion }) {
  const l1  = useRef();
  const l2  = useRef();
  const amb = useRef();

  useFrame(() => {
    const theme = getTheme(emotion);
    const c1 = new THREE.Color(theme.primary);
    const c2 = new THREE.Color(theme.secondary);
    if (l1.current)  l1.current.color.lerp(c1, 0.04);
    if (l2.current)  l2.current.color.lerp(c2, 0.04);
    if (amb.current) {
      amb.current.intensity = THREE.MathUtils.lerp(
        amb.current.intensity,
        theme.ambientIntensity,
        0.03
      );
    }
  });

  return (
    <>
      <ambientLight ref={amb} intensity={0.4} />
      <pointLight ref={l1} position={[5, 8, 5]}    intensity={2.5} color="#f59e0b" />
      <pointLight ref={l2} position={[-8, -5, -5]}  intensity={1.8} color="#7c3aed" />
      <pointLight position={[0, -8, 4]}             intensity={1.0} color="#ff0000" />
    </>
  );
}

// ── Drifting particles ───────────────────────────────────────────────
function DriftingParticles({ count = 120, initColor = "#f59e0b", colorKey = "primary", emotion }) {
  const mesh    = useRef();
  const mat     = useRef();
  const curSpd  = useRef(1.0);
  const curSize = useRef(0.12);

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
    const theme = getTheme(emotion);

    curSpd.current  = THREE.MathUtils.lerp(curSpd.current,  theme.speedMult,    0.03);
    curSize.current = THREE.MathUtils.lerp(curSize.current, theme.particleSize, 0.03);
    mat.current.size = curSize.current;

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

    mat.current.color.lerp(new THREE.Color(theme[colorKey] || theme.primary), 0.04);
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={mat}
        color={initColor}
        size={0.12}
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
}

// ── Dream core ───────────────────────────────────────────────────────
function DreamCore({ emotion }) {
  const groupRef    = useRef();
  const innerRef    = useRef();
  const ring1Mat    = useRef();
  const ring2Mat    = useRef();
  const ring3Mat    = useRef();
  const glowMat     = useRef();
  const curRotSpeed = useRef(0.15);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const theme = getTheme(emotion);

    curRotSpeed.current = THREE.MathUtils.lerp(curRotSpeed.current, theme.rotSpeed, 0.03);

    groupRef.current.rotation.y += delta * curRotSpeed.current;
    groupRef.current.rotation.x += delta * (curRotSpeed.current * 0.3);

    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 0.4) * 0.3;

    if (innerRef.current) {
      innerRef.current.rotation.z += delta * (curRotSpeed.current * 2.5);
      innerRef.current.rotation.x += delta * (curRotSpeed.current * 1.5);
    }

    const primary   = new THREE.Color(theme.primary);
    const secondary = new THREE.Color(theme.secondary);

    if (ring1Mat.current) ring1Mat.current.color.lerp(primary,   0.04);
    if (ring2Mat.current) ring2Mat.current.color.lerp(primary,   0.04);
    if (ring3Mat.current) ring3Mat.current.color.lerp(secondary, 0.04);
    if (glowMat.current)  glowMat.current.color.lerp(primary,    0.04);
  });

  return (
    <group ref={groupRef}>
      {/* center glow */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial ref={glowMat} color="#f59e0b" transparent opacity={0.18} />
      </mesh>

      {/* wireframe sphere */}
      <mesh>
        <sphereGeometry args={[1.5, 20, 20]} />
        <meshBasicMaterial ref={ring1Mat} color="#fcd34d" wireframe transparent opacity={0.4} />
      </mesh>

      {/* ring 1 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.06, 16, 80]} />
        <meshBasicMaterial ref={ring2Mat} color="#f59e0b" transparent opacity={0.8} />
      </mesh>

      {/* ring 2 */}
      <mesh rotation={[0.5, 0.3, 0]}>
        <torusGeometry args={[3.0, 0.04, 16, 80]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.55} />
      </mesh>

      {/* ring 3 counter-rotating */}
      <group ref={innerRef}>
        <mesh rotation={[1.2, 0, 0.8]}>
          <torusGeometry args={[3.5, 0.035, 16, 80]} />
          <meshBasicMaterial ref={ring3Mat} color="#a78bfa" transparent opacity={0.45} />
        </mesh>
      </group>

      {/* outer halo */}
      <mesh>
        <sphereGeometry args={[4.2, 32, 32]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

// ── Cinematic camera drift ───────────────────────────────────────────
function CameraDrift({ emotion }) {
  const { camera } = useThree();
  const curSpd     = useRef(1.0);

  useFrame((state) => {
    const theme = getTheme(emotion);
    curSpd.current = THREE.MathUtils.lerp(curSpd.current, theme.camSpeed, 0.025);

    const t = state.clock.getElapsedTime();
    camera.position.x = Math.sin(t * 0.1 * curSpd.current) * 3;
    camera.position.y = Math.cos(t * 0.08 * curSpd.current) * 1.5;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ── Full scene ───────────────────────────────────────────────────────
function DreamscapeCore({ emotion }) {
  return (
    <>
      <BackgroundController emotion={emotion} />
      <Stars count={2000} factor={2.5} fade speed={0.4} />
      <ReactiveLights emotion={emotion} />
      <DriftingParticles count={200} initColor="#f59e0b" colorKey="primary"   emotion={emotion} />
      <DriftingParticles count={100} initColor="#a78bfa" colorKey="secondary" emotion={emotion} />
      <DreamCore emotion={emotion} />
      <CameraDrift emotion={emotion} />
    </>
  );
}

export default function DreamscapeScene({ emotion = "default" }) {
  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 65 }} dpr={[1, 2]}>
      <DreamscapeCore emotion={emotion} />
    </Canvas>
  );
}