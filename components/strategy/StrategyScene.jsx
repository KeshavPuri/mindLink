"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useMemo } from "react";

// ── Phase node with HTML label ───────────────────────────────────────
function PhaseNode({ position, phase, isSelected, isHovered, onClick, onPointerOver, onPointerOut }) {
  const meshRef = useRef();
  const ringRef = useRef();

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(t * 0.5 + phase.number) * 0.12;
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.4;
    const target = isSelected ? 1.25 : isHovered ? 1.1 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.1);
  });

  const col = isSelected ? "#ffffff" : isHovered ? "#6ee7b7" : "#10b981";

  return (
    <group position={position}>
      {/* Glow sphere */}
      <mesh>
        <sphereGeometry args={[1.3, 32, 32]} />
        <meshBasicMaterial color="#10b981" transparent opacity={isSelected ? 0.15 : 0.06} />
      </mesh>

      {/* Main wireframe */}
      <mesh ref={meshRef} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
        <sphereGeometry args={[0.9, 28, 28]} />
        <meshBasicMaterial color={col} wireframe transparent opacity={isSelected ? 1.0 : 0.6} />
      </mesh>

      {/* Inner core */}
      <mesh onClick={onClick}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshBasicMaterial color={isSelected ? "#ffffff" : "#10b981"} transparent opacity={0.35} />
      </mesh>

      {/* Rotating ring */}
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.15, 0.025, 16, 80]} />
          <meshBasicMaterial color="#34d399" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* HTML label */}
      <Html position={[0, 1.7, 0]} center distanceFactor={12}>
        <div style={{
          background: isSelected ? "rgba(16,185,129,0.25)" : "rgba(0,0,0,0.75)",
          border: `1px solid ${isSelected ? "rgba(16,185,129,0.8)" : "rgba(16,185,129,0.3)"}`,
          borderRadius: "8px",
          padding: "4px 10px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          backdropFilter: "blur(8px)",
        }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.3em", color: "#6ee7b7", textTransform: "uppercase", marginBottom: "2px" }}>
            Phase {phase.number}
          </div>
          <div style={{ fontSize: "11px", letterSpacing: "0.1em", color: "#ffffff", textTransform: "uppercase", fontWeight: "300" }}>
            {phase.title}
          </div>
          <div style={{ fontSize: "8px", color: "rgba(100,200,150,0.6)", marginTop: "1px" }}>
            {phase.duration}
          </div>
        </div>
      </Html>
    </group>
  );
}

// ── Milestone node with label ────────────────────────────────────────
function MilestoneNode({ position, milestone, phaseNumber, isCompleted, isSelected, onClick, onPointerOver, onPointerOut }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(t * 0.9 + milestone.number * 1.2) * 0.07;
  });

  const col = isCompleted ? "#ffffff" : isSelected ? "#6ee7b7" : "#2dd4bf";

  return (
    <group position={position}>
      {/* Glow */}
      {(isCompleted || isSelected) && (
        <mesh>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshBasicMaterial color={isCompleted ? "#ffffff" : "#10b981"} transparent opacity={0.12} />
        </mesh>
      )}

      {/* Main sphere */}
      <mesh ref={meshRef} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
        <sphereGeometry args={[0.32, 20, 20]} />
        <meshBasicMaterial color={col} transparent opacity={isCompleted ? 0.95 : 0.65} />
      </mesh>

      {/* Label */}
      <Html position={[0, -0.75, 0]} center distanceFactor={12}>
        <div style={{
          background: "rgba(0,0,0,0.7)",
          border: `1px solid ${isCompleted ? "rgba(255,255,255,0.3)" : "rgba(45,212,191,0.25)"}`,
          borderRadius: "6px",
          padding: "3px 8px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          backdropFilter: "blur(6px)",
          maxWidth: "120px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "7px", color: "rgba(100,200,180,0.6)", letterSpacing: "0.25em", textTransform: "uppercase" }}>
            {phaseNumber}.{milestone.number}
          </div>
          <div style={{ fontSize: "9px", color: isCompleted ? "#ffffff" : "#a7f3d0", letterSpacing: "0.05em", lineHeight: "1.2" }}>
            {milestone.title}
          </div>
        </div>
      </Html>
    </group>
  );
}

// ── Animated connection line ─────────────────────────────────────────
function ConnectionLine({ start, end, color = "#10b981", opacity = 0.3 }) {
  const dotRef = useRef();
  const progress = useRef(0);

  const points = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const mid = s.clone().lerp(e, 0.5);
    mid.y += 0.8;
    return new THREE.QuadraticBezierCurve3(s, mid, e).getPoints(40);
  }, [start, end]);

  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  useFrame((_, delta) => {
    progress.current = (progress.current + delta * 0.35) % 1;
    if (dotRef.current) {
      const idx = Math.floor(progress.current * (points.length - 1));
      const p = points[idx] || points[0];
      dotRef.current.position.set(p.x, p.y, p.z);
    }
  });

  return (
    <group>
      <line geometry={geo}>
        <lineBasicMaterial color={color} transparent opacity={opacity} />
      </line>
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#6ee7b7" />
      </mesh>
    </group>
  );
}

// ── Particles ────────────────────────────────────────────────────────
function Particles() {
  const mesh = useRef();
  const count = 80;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
      vel[i * 3]     = (Math.random() - 0.5) * 0.004;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.004;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.004;
    }
    return [pos, vel];
  }, []);

  useFrame(() => {
    if (!mesh.current) return;
    const pos = mesh.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3]     += velocities[i * 3];
      pos[i * 3 + 1] += velocities[i * 3 + 1];
      pos[i * 3 + 2] += velocities[i * 3 + 2];
      if (Math.abs(pos[i * 3])     > 25) pos[i * 3]     *= -0.9;
      if (Math.abs(pos[i * 3 + 1]) > 15) pos[i * 3 + 1] *= -0.9;
      if (Math.abs(pos[i * 3 + 2]) > 25) pos[i * 3 + 2] *= -0.9;
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#10b981" size={0.07} transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

// ── Scene core ───────────────────────────────────────────────────────
function SceneCore({ strategy, selectedNode, completedNodes, hoveredId, onSelectNode, onHoverNode }) {
  const phases = strategy?.phases || [];

  // Phases: evenly spread horizontally
  const phasePositions = useMemo(() =>
    phases.map((_, i) => {
      const spread = (phases.length - 1) * 4.5;
      const x = -spread / 2 + i * 4.5;
      return [x, 0, 0];
    }), [phases]);

  // Milestones: arc below each phase
  const milestonePositions = useMemo(() =>
    phases.map((phase, pi) => {
      const [px, , pz] = phasePositions[pi];
      return (phase.milestones || []).map((_, mi) => {
        const count = phase.milestones.length;
        const angle = (mi / (count - 1 || 1) - 0.5) * Math.PI * 0.8;
        return [px + Math.sin(angle) * 2.2, -2.8, pz + Math.cos(angle) * 0.6];
      });
    }), [phases, phasePositions]);

  return (
    <>
      <color attach="background" args={["#010a04"]} />
      <Stars count={1200} factor={2.0} fade speed={0.25} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 8, 5]}    intensity={1.8} color="#10b981" />
      <pointLight position={[-10, -4, -6]} intensity={0.8} color="#065f46" />
      <pointLight position={[10, -4, -6]}  intensity={0.6} color="#134e4a" />

      {/* Phase → Phase connections */}
      {phasePositions.map((pos, i) => {
        if (i === phasePositions.length - 1) return null;
        return <ConnectionLine key={`pp${i}`} start={pos} end={phasePositions[i + 1]} color="#10b981" opacity={0.35} />;
      })}

      {/* Phase → Milestone connections */}
      {phases.map((phase, pi) =>
        milestonePositions[pi]?.map((mpos, mi) => (
          <ConnectionLine key={`pm${pi}${mi}`} start={phasePositions[pi]} end={mpos} color="#2dd4bf" opacity={0.2} />
        ))
      )}

      {/* Phase nodes */}
      {phases.map((phase, i) => (
        <PhaseNode
          key={phase.id}
          position={phasePositions[i]}
          phase={phase}
          isSelected={selectedNode?.id === phase.id}
          isHovered={hoveredId === phase.id}
          onClick={() => onSelectNode({ ...phase, nodeType: "phase" })}
          onPointerOver={() => onHoverNode(phase.id)}
          onPointerOut={() => onHoverNode(null)}
        />
      ))}

      {/* Milestone nodes */}
      {phases.map((phase, pi) =>
        phase.milestones?.map((milestone, mi) => (
          <MilestoneNode
            key={milestone.id}
            position={milestonePositions[pi][mi]}
            milestone={milestone}
            phaseNumber={phase.number}
            isCompleted={completedNodes.includes(milestone.id)}
            isSelected={selectedNode?.id === milestone.id}
            onClick={() => onSelectNode({ ...milestone, nodeType: "milestone", parentPhase: phase.title, parentPhaseNumber: phase.number })}
            onPointerOver={() => onHoverNode(milestone.id)}
            onPointerOut={() => onHoverNode(null)}
          />
        ))
      )}

      <Particles />

      <OrbitControls
        enablePan enableZoom enableRotate
        minDistance={8} maxDistance={28}
        target={[0, -1, 0]}
        makeDefault
      />
    </>
  );
}

export default function StrategyScene({ strategy, selectedNode, completedNodes = [], hoveredId, onSelectNode, onHoverNode }) {
  return (
    <Canvas camera={{ position: [0, 3, 18], fov: 60 }} dpr={[1, 2]}>
      <SceneCore
        strategy={strategy}
        selectedNode={selectedNode}
        completedNodes={completedNodes}
        hoveredId={hoveredId}
        onSelectNode={onSelectNode}
        onHoverNode={onHoverNode}
      />
    </Canvas>
  );
}