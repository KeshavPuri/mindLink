"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Billboard,
  Stars,
  Sparkles,
  MeshDistortMaterial,
} from "@react-three/drei";
import { useState, useRef, useEffect } from "react";
import * as THREE from "three";

// ---------- utils ----------
const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// warm neon batch color
const batchColor = "#ffb347";

// ---------- AI helpers (same /api/neural use) ----------
async function askAI(prompt) {
  const res = await fetch("/api/neural", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    console.error("Portal AI route error", await res.text());
    throw new Error("Portal AI route failed");
  }
  const data = await res.json();
  return data.text;
}

async function getSubTopics(label, path) {
  const txt = await askAI(
    `
You are building a sci-fi knowledge PORTAL tree.

Current portal topic: "${label}"
Full path: "${path}"

Return 5 short, distinct sub-destinations (like sub-topics).
Only output a comma separated list, no numbering, no extra text.
`.trim()
  );

  return String(txt)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 5);
}

async function getPortalInfo(label, path) {
  return await askAI(
    `
You are an info panel below a glowing portal.

Topic: "${label}"
Path: "${path}"

Return under 160 words formatted as:
1–2 sentence summary,
then 3–6 bullet points starting with "- ".
Do NOT add headings.
`.trim()
  );
}

// ---------- positions: random, non-overlapping 2D ring ----------
function makePortalPositions(count, depth = 0) {
  const positions = [];
  const baseRadius = 11 + depth * 3;
  const minDist = 6.0;

  for (let i = 0; i < count; i++) {
    let chosen = null;
    let tries = 0;

    while (!chosen && tries < 50) {
      const angle = Math.random() * Math.PI * 2;
      const radius = baseRadius + Math.random() * 3;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.6;
      const candidate = [x, y, 0];

      let ok = true;
      for (const p of positions) {
        const dx = candidate[0] - p[0];
        const dy = candidate[1] - p[1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          ok = false;
          break;
        }
      }

      if (ok) {
        chosen = candidate;
      }
      tries++;
    }

    if (!chosen) {
      // fallback: line pe daal de agar bahut tight ho gaya
      chosen = [baseRadius + i * minDist, 0, 0];
    }

    positions.push(chosen);
  }

  return positions;
}

// ---------- camera rig: zoom into portal and back ----------
function PortalCameraRig({ zoomTarget }) {
  const { camera } = useThree();
  const current = useRef(new THREE.Vector3(0, 0, 30));

  useFrame((_, delta) => {
    const target = zoomTarget
      ? new THREE.Vector3(zoomTarget[0], zoomTarget[1], 6)
      : new THREE.Vector3(0, 0, 30);

    current.current.lerp(target, delta * 2.5);
    camera.position.lerp(current.current, delta * 2.5);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ---------- Magic portal ----------
function MagicPortal({ portal, isRoot, isZooming, onEnter, onInfo }) {
  const outerRing = useRef();
  const innerRing = useRef();
  const coreRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (outerRing.current) outerRing.current.rotation.z -= delta * 0.5;
    if (innerRing.current) innerRing.current.rotation.z += delta * 0.9;

    if (coreRef.current) {
      const targetScale = isZooming ? 1.9 : hovered ? 1.3 : 1.0;
      coreRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        delta * 6
      );
    }
  });

  const label = portal.label.toUpperCase();

  return (
    <group
      position={portal.pos}
      onClick={(e) => {
        e.stopPropagation();
        onEnter(portal);
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
        setHovered(true);
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
        setHovered(false);
      }}
    >
      {/* invisible hit area */}
      <mesh>
        <circleGeometry args={[4.0, 64]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* core */}
      <mesh ref={coreRef}>
        <circleGeometry args={[2.6, 64]} />
        <MeshDistortMaterial
          color={hovered || isZooming ? "#fffbeb" : batchColor}
          speed={3}
          distort={0.35}
          radius={1}
          toneMapped={false}
        />
      </mesh>

      {/* inner ring */}
      <mesh ref={innerRing} position={[0, 0, 0.05]}>
        <torusGeometry args={[3.0, 0.18, 18, 60]} />
        <MeshDistortMaterial
          color="#ffd27f"
          speed={2}
          distort={0.45}
          toneMapped={false}
        />
      </mesh>

      {/* outer ring */}
      <mesh ref={outerRing} position={[0, 0, 0.02]}>
        <torusGeometry args={[3.6, 0.06, 16, 90]} />
        <meshBasicMaterial
          color="#fff7cc"
          toneMapped={false}
          transparent
          opacity={0.45}
        />
      </mesh>

      <Sparkles
        count={isRoot ? 140 : 90}
        scale={6.5}
        size={9}
        speed={0.5}
        opacity={1}
        color={hovered || isZooming ? "#ffffff" : "#ff8800"}
      />

      {/* label + info */}
      <Billboard position={[0, -4.3, 0]}>
        <Text
          fontSize={0.8}
          color="#ffeb99"
          fontWeight={700}
          outlineWidth={0.02}
          outlineColor="black"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
        <Text
          position={[0, -1.0, 0]}
          fontSize={0.4}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          onClick={(e) => {
            e.stopPropagation();
            onInfo(portal);
          }}
        >
          [ INFO ]
        </Text>
      </Billboard>
    </group>
  );
}

// ---------- MAIN PORTAL MODE ----------
export default function PortalMode({ onExit, initialTopic = "" }) {
  const [phase, setPhase] = useState(initialTopic ? "PORTALS" : "INPUT"); // INPUT | PORTALS
  const [topic, setTopic] = useState(initialTopic || "");
  const [portals, setPortals] = useState([]);
  const [zoomingId, setZoomingId] = useState(null);
  const [zoomTarget, setZoomTarget] = useState(null);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // agar initialTopic aaya hai (page se), to auto root portal banao
  useEffect(() => {
    if (initialTopic && portals.length === 0) {
      startPortalRoot(initialTopic);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTopic, portals.length]);

  const startPortalRoot = (forcedTopic) => {
    const t = (forcedTopic ?? topic).trim();
    if (!t) return;

    const root = {
      id: uid(),
      label: t,
      path: t,
      depth: 0,
      pos: [0, 0, 0],
    };

    setTopic(t);
    setPortals([root]);
    setPhase("PORTALS");
  };

  const enterPortal = async (portal) => {
    if (loading || !portal) return;
    setZoomingId(portal.id);
    setZoomTarget(portal.pos);
    setLoading(true);

    try {
      const subs = await getSubTopics(portal.label, portal.path);
      if (!subs || subs.length === 0) {
        return;
      }

      const positions = makePortalPositions(subs.length, portal.depth + 1);

      const children = subs.map((label, idx) => ({
        id: uid(),
        label,
        path: `${portal.path} > ${label}`,
        depth: portal.depth + 1,
        pos: positions[idx],
      }));

      // thoda sa zoom feel ke liye artificial delay (optional)
      await new Promise((r) => setTimeout(r, 350));

      setPortals(children);
    } catch (err) {
      console.error("portal enter error:", err);
    } finally {
      setZoomingId(null);
      setZoomTarget(null);
      setLoading(false);
    }
  };

  const handleInfo = async (portal) => {
    if (!portal) return;
    setLoading(true);
    try {
      const text = await getPortalInfo(portal.label, portal.path);
      setInfo({
        title: portal.label,
        text,
        path: portal.path,
      });
    } catch (err) {
      console.error("portal info error:", err);
    } finally {
      setLoading(false);
    }
  };

  const rootLabel =
    portals.length === 1 && portals[0].depth === 0
      ? portals[0].label
      : topic;

  return (
    <div className="w-screen h-screen bg-black relative">
      <Canvas camera={{ position: [0, 0, 30], fov: 50 }}>
        <color attach="background" args={["#05020b"]} />
        <Stars
          radius={120}
          depth={40}
          count={3200}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        <ambientLight intensity={1.2} />
        <pointLight
          position={[20, 20, 10]}
          intensity={2.2}
          color="#ffddaa"
        />

        <PortalCameraRig zoomTarget={zoomTarget} />

        {phase === "PORTALS" &&
          portals.map((p) => (
            <MagicPortal
              key={p.id}
              portal={p}
              isRoot={p.depth === 0}
              isZooming={zoomingId === p.id}
              onEnter={enterPortal}
              onInfo={handleInfo}
            />
          ))}

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          enableDamping
          dampingFactor={0.1}
          maxDistance={80}
          minDistance={10}
        />
      </Canvas>

      {/* TOP BAR */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-black/70 backdrop-blur flex items-center justify-between px-6 border-b border-purple-400/25 z-40">
        <div className="flex flex-col">
          <span className="text-purple-300 tracking-[0.25em] text-xs uppercase">
            PORTAL EXPLORER
          </span>
          {rootLabel && phase === "PORTALS" && (
            <span className="text-[10px] tracking-[0.18em] uppercase text-slate-300 mt-0.5">
              ROOT: {rootLabel}
            </span>
          )}
        </div>

        <button
          onClick={onExit}
          className="text-xs tracking-[0.2em] uppercase text-slate-200 hover:text-white"
        >
          EXIT ✕
        </button>
      </div>

      {/* INPUT OVERLAY (sirf tab jab initialTopic nahi aaya) */}
      {phase === "INPUT" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/55 backdrop-blur-sm z-30">
          <div className="text-[11px] md:text-xs tracking-[0.3em] uppercase text-slate-300">
            Initialize Subject
          </div>
          <input
            autoFocus
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startPortalRoot()}
            placeholder='TYPE A TOPIC…  (e.g. "Elon Musk")'
            className="px-6 py-3 w-[300px] md:w-[420px] bg-black/80 border border-purple-300/70 text-center text-xs md:text-sm tracking-[0.2em] uppercase rounded-full outline-none focus:border-purple-400 focus:shadow-[0_0_25px_rgba(192,132,252,0.8)] transition"
          />
          <button
            onClick={startPortalRoot}
            className="mt-2 px-10 py-3 border border-purple-400/80 text-purple-200 text-[10px] tracking-[0.3em] uppercase rounded-full bg-black/70 hover:bg-purple-500/10 hover:shadow-[0_0_25px_rgba(192,132,252,0.8)] transition"
          >
            ENTER PORTAL SPACE
          </button>
          <p className="mt-3 text-[10px] text-slate-300 tracking-[0.2em] uppercase text-center max-w-md">
            Click the central portal to open 5 new portals. Click again on a
            child portal to go deeper.
          </p>
        </div>
      )}

      {/* INFO PANEL – 🔼 font size bigger here */}
      {info && (
        <div className="absolute right-4 bottom-4 w-88 max-w-xs bg-black/92 border border-purple-300/40 rounded-lg p-4 text-[13px] md:text-base leading-relaxed backdrop-blur z-50 max-h-[60vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[12px] tracking-[0.25em] uppercase text-slate-400">
              Portal Insight
            </div>
            <button
              onClick={() => setInfo(null)}
              className="text-slate-300 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
          <div className="text-[12px] md:text-sm text-slate-400 mb-2 break-words">
            PATH: <span className="text-purple-200">{info.path}</span>
          </div>
          <div className="text-base md:text-lg font-semibold mb-2 text-purple-200">
            {info.title}
          </div>
          <p className="text-[13px] md:text-base text-slate-100 whitespace-pre-wrap">
            {info.text}
          </p>
        </div>
      )}

      {/* LOADING LABEL */}
      {loading && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] uppercase text-purple-300 animate-pulse z-50">
          Opening Portals…
        </div>
      )}
    </div>
  );
}
