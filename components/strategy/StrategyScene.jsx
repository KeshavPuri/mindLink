"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useMemo } from "react";

// ── Phase node with HTML label ───────────────────────────────────────
function PhaseNode({ position, phase, isSelected, isHovered, onClick, onPointerOver, onPointerOut }) {
  const meshRef = useRef();
  const ringRef = useRef();
  const innerRef = useRef();

  // Phase-based colors
  const phaseColors = {
    1: { base: "#3b82f6", light: "#60a5fa", glow: "rgba(59, 130, 246, 0.3)" }, // blue
    2: { base: "#8b5cf6", light: "#a78bfa", glow: "rgba(139, 92, 246, 0.3)" }, // purple
    3: { base: "#f59e0b", light: "#fbbf24", glow: "rgba(245, 158, 11, 0.3)" }, // amber
    4: { base: "#10b981", light: "#6ee7b7", glow: "rgba(16, 185, 129, 0.3)" }, // emerald
  };
  const colors = phaseColors[phase.number] || phaseColors[1];

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(t * 0.5 + phase.number) * 0.1;
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.4;
    if (innerRef.current) innerRef.current.rotation.x += delta * 0.2;
    const target = isSelected ? 1.3 : isHovered ? 1.15 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.08);
  });

  const col = isSelected ? "#ffffff" : isHovered ? colors.light : colors.base;

  return (
    <group position={position}>
      {/* Glow sphere */}
      <mesh>
        <sphereGeometry args={[1.4, 24, 24]} />
        <meshBasicMaterial color={colors.base} transparent opacity={isSelected ? 0.2 : 0.08} />
      </mesh>

      {/* Rotating octahedron for visual interest */}
      <mesh ref={innerRef} onClick={onClick}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshBasicMaterial color={colors.light} transparent opacity={isSelected ? 0.9 : 0.4} />
      </mesh>

      {/* Main wireframe sphere */}
      <mesh ref={meshRef} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
        <sphereGeometry args={[0.85, 20, 20]} />
        <meshBasicMaterial color={col} wireframe transparent opacity={isSelected ? 0.95 : 0.55} linewidth={2} />
      </mesh>

      {/* Inner illuminated core */}
      <mesh onClick={onClick}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color={isSelected ? "#ffffff" : colors.light} transparent opacity={isSelected ? 1.0 : 0.5} />
      </mesh>

      {/* Rotating ring */}
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.1, 0.03, 12, 60]} />
          <meshBasicMaterial color={colors.light} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* HTML label */}
      <Html position={[0, 1.6, 0]} center distanceFactor={10}>
        <div style={{
          background: isSelected ? `${colors.glow}` : "rgba(0,0,0,0.8)",
          border: `2px solid ${isSelected ? colors.light : colors.base}`,
          borderRadius: "12px",
          padding: "7px 14px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          backdropFilter: "blur(10px)",
          boxShadow: `0 0 20px ${isSelected ? colors.light + "40" : "transparent"}`,
        }}>
          <div style={{ fontSize: "8px", letterSpacing: "0.35em", color: colors.light, textTransform: "uppercase", marginBottom: "4px", fontWeight: "600" }}>
            Phase {phase.number}
          </div>
          <div style={{ fontSize: "11px", letterSpacing: "0.08em", color: "#ffffff", textTransform: "uppercase", fontWeight: "400", marginBottom: "3px" }}>
            {phase.title}
          </div>
          <div style={{ fontSize: "8px", color: colors.base + "99", letterSpacing: "0.05em" }}>
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
  const rotatorRef = useRef();

  // Phase-based colors for milestones
  const phaseColors = {
    1: { base: "#3b82f6", light: "#60a5fa" }, // blue
    2: { base: "#8b5cf6", light: "#a78bfa" }, // purple
    3: { base: "#f59e0b", light: "#fbbf24" }, // amber
    4: { base: "#10b981", light: "#6ee7b7" }, // emerald
  };
  const colors = phaseColors[phaseNumber] || phaseColors[1];

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(t * 0.8 + milestone.number * 1.1) * 0.06;
    if (rotatorRef.current) rotatorRef.current.rotation.z += delta * 0.5;
  });

  const col = isCompleted ? "#ffffff" : isSelected ? colors.light : colors.base;

  return (
    <group position={position}>
      {/* Glow */}
      {(isCompleted || isSelected) && (
        <mesh>
          <sphereGeometry args={[0.48, 16, 16]} />
          <meshBasicMaterial color={isCompleted ? "#ffffff" : colors.base} transparent opacity={isSelected ? 0.15 : 0.08} />
        </mesh>
      )}

      {/* Rotating tetrahedron for visual variety */}
      <group ref={rotatorRef}>
        <mesh>
          <tetrahedronGeometry args={[0.2]} />
          <meshBasicMaterial color={col} transparent opacity={isCompleted ? 0.9 : 0.7} />
        </mesh>
      </group>

      {/* Main sphere */}
      <mesh ref={meshRef} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshBasicMaterial color={col} transparent opacity={isCompleted ? 1.0 : 0.7} />
      </mesh>

      {/* Label */}
      <Html position={[0, -0.95, 0]} center distanceFactor={8}>
        <div style={{
          background: "rgba(0,0,0,0.8)",
          border: `1.5px solid ${isCompleted ? "#ffffff" : colors.base}`,
          borderRadius: "8px",
          padding: "5px 11px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          backdropFilter: "blur(8px)",
          maxWidth: "130px",
          textAlign: "center",
          boxShadow: `0 0 15px ${isSelected ? colors.base + "50" : "transparent"}`,
        }}>
          <div style={{ fontSize: "7px", color: colors.light, letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: "600", marginBottom: "3px" }}>
            {phaseNumber}.{milestone.number}
          </div>
          <div style={{ fontSize: "9px", color: isCompleted ? "#ffffff" : colors.light, letterSpacing: "0.05em", lineHeight: "1.4", fontWeight: "500" }}>
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

  // Phases: arranged vertically (tree-like flow)
  const phasePositions = useMemo(() =>
    phases.map((_, i) => {
      return [0, -i * 6, 0]; // Vertical spacing, centered on X
    }), [phases]);

  // Milestones: grouped on sides of each phase
  const milestonePositions = useMemo(() =>
    phases.map((phase, pi) => {
      const [px, py, pz] = phasePositions[pi];
      const milestones = phase.milestones || [];
      const count = milestones.length;
      
      // Split milestones between left and right sides
      return milestones.map((_, mi) => {
        const isLeft = mi % 2 === 0;
        const positionInSide = Math.floor(mi / 2);
        const xOffset = isLeft ? -3.2 : 3.2;
        const yOffset = (positionInSide - Math.floor(count / 4)) * 1.1;
        return [px + xOffset, py + yOffset, pz];
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
        minDistance={10} maxDistance={35}
        target={[0, -6, 0]}
        makeDefault
      />
    </>
  );
}

export default function StrategyScene({ strategy, selectedNode, completedNodes = [], hoveredId, onSelectNode, onHoverNode }) {
  return (
    <Canvas camera={{ position: [12, -6, 16], fov: 55 }} dpr={[1, 2]}>
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