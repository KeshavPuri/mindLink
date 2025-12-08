"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Line,
  Stars,
  Billboard,
} from "@react-three/drei";
import { useState, useRef, useEffect, useMemo } from "react";
import * as THREE from "three";

// ------------ AI helper ------------
async function askAI(prompt) {
  const res = await fetch("/api/neural", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    console.error("AI route error", await res.text());
    throw new Error("AI route failed");
  }

  const data = await res.json();
  return data.text;
}

const randomBatchColor = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 100%, 60%)`;

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Base child layout: one-direction tree (flow → +X).
 * (Ab direct use nahi ho raha, par rakha hai in case tum aage tweak karna chaho.)
 */
function makeChildPositions(parentPos, count) {
  const out = [];

  const stepX = 18;
  const stepY = 7;
  const stepZ = 4;
  const jitter = 0.6;

  const baseX = parentPos[0] + stepX;
  const centerIndex = (count - 1) / 2;

  for (let i = 0; i < count; i++) {
    const offsetIndex = i - centerIndex;

    const x = baseX + (Math.random() - 0.5) * jitter;
    const y =
      parentPos[1] +
      offsetIndex * stepY +
      (Math.random() - 0.5) * jitter;
    const z =
      parentPos[2] +
      offsetIndex * (stepZ * 0.5) +
      (Math.random() - 0.5) * jitter;

    out.push([x, y, z]);
  }

  return out;
}

// ------------ NEW: radial + collision-safe child position ------------
const MIN_NODE_DISTANCE = 7.5;

function getChildPosition(parentPos, allNodes) {
  let attempts = 0;

  while (attempts < 40) {
    // base direction: from origin towards parent
    const dir = new THREE.Vector3(
      parentPos[0],
      parentPos[1],
      parentPos[2]
    );

    if (dir.lengthSq() === 0) {
      // if root at origin → random direction
      dir.set(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      );
    }

    dir.normalize();

    // thoda jitter, taaki har sub-branch alag direction me nikle
    dir.x += (Math.random() - 0.5) * 1.5;
    dir.y += (Math.random() - 0.5) * 1.5;
    dir.z += (Math.random() - 0.5) * 1.5;
    dir.normalize();

    const dist = 8 + Math.random() * 4;
    const candidate = [
      parentPos[0] + dir.x * dist,
      parentPos[1] + dir.y * dist,
      parentPos[2] + dir.z * dist,
    ];

    const tooClose = allNodes.some((n) => {
      const dx = n.pos[0] - candidate[0];
      const dy = n.pos[1] - candidate[1];
      const dz = n.pos[2] - candidate[2];
      return (
        dx * dx + dy * dy + dz * dz <
        MIN_NODE_DISTANCE * MIN_NODE_DISTANCE
      );
    });

    if (!tooClose) return candidate;

    attempts++;
  }

  // fallback: bahut door random jagah, almost kabhi hit nahi karega
  return [
    parentPos[0] + (Math.random() - 0.5) * 30,
    parentPos[1] + (Math.random() - 0.5) * 30,
    parentPos[2] + (Math.random() - 0.5) * 30,
  ];
}

// ------------ Node visual ------------
function NeuralNode({
  node,
  onPrimaryClick,
  onInfo,
  highlighted,
}) {
  const groupRef = useRef();
  const hoverRef = useRef(false);

  useFrame((state, dt) => {
    if (!groupRef.current) return;

    groupRef.current.rotation.y += dt * 0.6;
    groupRef.current.rotation.x += dt * 0.22;

    let targetScale = 1;
    if (highlighted) {
      const pulse =
        1.35 + Math.sin(state.clock.elapsedTime * 6) * 0.16;
      targetScale = pulse;
    } else if (hoverRef.current) {
      targetScale = 1.15;
    }

    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      dt * 6
    );
  });

  const baseColor = highlighted ? "#ffffff" : node.color || "#f7ff9c";
  const labelWidth = Math.max(3.2, node.label.length * 0.3);

  return (
    <group
      position={node.pos}
      onPointerOver={(e) => {
        e.stopPropagation();
        hoverRef.current = true;
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        hoverRef.current = false;
        document.body.style.cursor = "auto";
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        const btn = e.button ?? e.nativeEvent?.button;
        if (btn === 0) {
          onPrimaryClick(node);
        } else if (btn === 2) {
          onInfo(node);
        }
      }}
      onContextMenu={(e) => {
  // R3F event → original DOM event nativeEvent me hota hai
  if (e.nativeEvent && typeof e.nativeEvent.preventDefault === "function") {
    e.nativeEvent.preventDefault();
  }
  e.stopPropagation();
  onInfo(node);
}}

    >
      <group ref={groupRef}>
        {/* outer wireframe cube */}
        <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <boxGeometry args={[2.4, 2.4, 2.4]} />
          <meshBasicMaterial
            color={baseColor}
            wireframe
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* inner core */}
        <mesh>
          <boxGeometry args={[1.0, 1.0, 1.0]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={baseColor}
            emissiveIntensity={highlighted ? 1.9 : 1.0}
            roughness={0.25}
            metalness={0.4}
          />
        </mesh>
      </group>

      {/* label strip */}
      <Billboard position={[0, -3.2, 0]}>
        <mesh>
          <planeGeometry args={[labelWidth, 1.1]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={0.9}
            depthWrite={false}
          />
        </mesh>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.7}
          color="#f7ff9c"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.16}
        >
          {node.label.toUpperCase()}
        </Text>
      </Billboard>
    </group>
  );
}

// ------------ Scene ------------
function NeuralScene({
  nodes,
  onPrimaryClick,
  onInfo,
  highlightNodeId,
  focusPoint,
}) {
  const controlsRef = useRef();
  const targetV = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    if (!controlsRef.current || !focusPoint) return;
    targetV.current.set(focusPoint[0], focusPoint[1], focusPoint[2]);
    controlsRef.current.target.lerp(targetV.current, 0.08);
    controlsRef.current.update();
  });

  return (
    <>
      <color attach="background" args={["#02040c"]} />
      <ambientLight intensity={1.2} />
      <pointLight position={[25, 25, 18]} intensity={2} />
      <Stars count={3200} factor={3} fade speed={1.1} />

      {nodes.map((n) => {
        if (!n.parent) return null;
        const parent = nodes.find((p) => p.id === n.parent);
        if (!parent) return null;
        return (
          <Line
            key={`L-${n.id}`}
            points={[parent.pos, n.pos]}
            color={n.color || "#f7ff9c"}
            lineWidth={1.4}
            transparent
            opacity={0.55}
          />
        );
      })}

      {nodes.map((n) => (
        <NeuralNode
          key={n.id}
          node={n}
          onPrimaryClick={onPrimaryClick}
          onInfo={onInfo}
          highlighted={highlightNodeId === n.id}
        />
      ))}

      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        enableDamping
        dampingFactor={0.1}
        maxDistance={200}
        minDistance={8}
      />
    </>
  );
}

// ------------ Main NeuralMode ------------
export default function NeuralMode({
  onExit,
  onSave,
  initialTopic = "",
  initialSnapshot = null,
}) {
  const [phase, setPhase] = useState(
    initialSnapshot ? "GRAPH" : initialTopic ? "GRAPH" : "INPUT"
  );
  const [topic, setTopic] = useState(
    initialSnapshot?.topic || initialTopic || ""
  );
  const [nodes, setNodes] = useState(initialSnapshot?.nodes || []);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [highlightNodeId, setHighlightNodeId] = useState(null);
  const [focusPoint, setFocusPoint] = useState(null);

  const expandingRef = useRef(new Set());
  const autoStartedRef = useRef(false);

  // triple-click detection
  const [clickState, setClickState] = useState({
    nodeId: null,
    count: 0,
    time: 0,
  });

  useEffect(() => {
    const handler = (e) => {
      if (phase === "GRAPH") e.preventDefault();
    };
    window.addEventListener("contextmenu", handler);
    return () => window.removeEventListener("contextmenu", handler);
  }, [phase]);

  useEffect(() => {
    if (
      initialTopic &&
      !initialSnapshot &&
      !autoStartedRef.current &&
      phase === "GRAPH" &&
      nodes.length === 0
    ) {
      autoStartedRef.current = true;
      startGraph(initialTopic);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTopic, initialSnapshot, phase, nodes.length]);

  const callAIList = async (label, path) => {
    const txt = await askAI(
      `Context path: "${path}".
Give 4 short, distinct sub-topics of "${label}" inside this context.
Return ONLY a comma-separated list, no extra text.`
    );

    return String(txt)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 4);
  };

  const callAIInfo = async (label, path) => {
    return await askAI(
      `You are describing a node inside an interactive 3D mind-map.

Topic: "${label}"
Context path: "${path}"

Return:
- First 1–2 sentences: concise summary.
- Then 3–6 bullet points, each starting with "- ".
Total under 160 words.`
    );
  };

  const startGraph = async (forcedTopic) => {
    const baseTopic = (forcedTopic ?? topic).trim();
    if (!baseTopic) return;

    setPhase("GRAPH");
    setLoading(true);

    const root = {
      id: uid(),
      label: baseTopic,
      color: "#ffffff",
      parent: null,
      pos: [0, 0, 0],
      path: baseTopic,
    };

    setTopic(baseTopic);
    setNodes([root]);
    setHighlightNodeId(root.id);
    setFocusPoint([0, 0, 0]);

    await expandNode(root, true);
    setLoading(false);
  };

  const expandNode = async (node, isRoot = false) => {
    if (!node || expandingRef.current.has(node.id)) return;

    expandingRef.current.add(node.id);
    setLoading(true);

    try {
      const subs = await callAIList(node.label, node.path || node.label);
      const color = isRoot ? randomBatchColor() : randomBatchColor();

      setNodes((prev) => {
        const existingKeys = new Set(
          prev.map(
            (n) => `${n.parent || "root"}|${n.label.toLowerCase()}`
          )
        );

        const newNodes = [...prev];

        subs.forEach((label) => {
          const key = `${node.id || "root"}|${label.toLowerCase()}`;
          if (existingKeys.has(key)) return;

          const allNodes = [...prev, ...newNodes.slice(prev.length)];
          const safePos = getChildPosition(node.pos, allNodes);

          const newNode = {
            id: uid(),
            label,
            color,
            parent: node.id,
            pos: safePos,
            path: (node.path || node.label) + " > " + label,
          };

          newNodes.push(newNode);
        });

        return newNodes;
      });
    } catch (err) {
      console.error("expandNode error:", err);
    } finally {
      expandingRef.current.delete(node.id);
      setLoading(false);
    }
  };

  const handleInfo = async (node) => {
    if (!node) return;
    setLoading(true);
    try {
      const text = await callAIInfo(node.label, node.path || node.label);
      setInfo({
        title: node.label,
        text,
        path: node.path || node.label,
        color: node.color || "#f7ff9c",
      });
    } catch (err) {
      console.error("info error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFocusNode = (node) => {
    if (!node) return;
    setFocusPoint(node.pos);
    setHighlightNodeId(node.id);
    handleInfo(node);
  };

  const handlePrimaryClick = (node) => {
    const now = performance.now();
    setClickState((prev) => {
      if (prev.nodeId === node.id && now - prev.time < 800) {
        const newCount = prev.count + 1;
        if (newCount >= 3) {
          // triple click -> focus
          handleFocusNode(node);
          return { nodeId: null, count: 0, time: 0 };
        } else {
          expandNode(node);
          return { nodeId: node.id, count: newCount, time: now };
        }
      } else {
        expandNode(node);
        return { nodeId: node.id, count: 1, time: now };
      }
    });
  };

  const handleSaveSnapshot = () => {
    if (!onSave || !topic || nodes.length === 0) return;
    onSave({
      id: uid(),
      topic,
      nodes,
      savedAt: new Date().toISOString(),
    });
  };

  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    const match = nodes.find((n) =>
      n.label.toLowerCase().includes(q)
    );
    if (match) {
      handleFocusNode(match);
    }
  };

  useEffect(() => {
    if (!highlightNodeId) return;
    const id = setTimeout(() => setHighlightNodeId(null), 4500);
    return () => clearTimeout(id);
  }, [highlightNodeId]);

  const nodeCountLabel = useMemo(
    () => `${Math.max(nodes.length, 1)} nodes`,
    [nodes.length]
  );

  return (
    <div className="w-screen h-screen bg-black relative">
      <Canvas camera={{ position: [0, 0, 40], fov: 55 }}>
        <NeuralScene
          nodes={nodes}
          onPrimaryClick={handlePrimaryClick}
          onInfo={handleInfo}
          highlightNodeId={highlightNodeId}
          focusPoint={focusPoint}
        />
      </Canvas>

      {/* TOP BAR */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-black/70 backdrop-blur flex items-center justify-between px-6 border-b border-white/15 z-40">
        <div className="flex items-center gap-3">
          <span className="text-yellow-200 tracking-[0.25em] text-xs uppercase">
            NEURAL EXPLORER
          </span>
          {nodes.length > 0 && (
            <span className="text-[10px] tracking-[0.18em] uppercase text-slate-300">
              {nodeCountLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search node…"
            className="px-3 py-1.5 text-[10px] bg-black/60 border border-cyan-300/60 rounded-full outline-none tracking-[0.15em] uppercase w-40"
          />
          <button
            onClick={handleSearch}
            className="text-[10px] tracking-[0.18em] uppercase px-3 py-1.5 border border-cyan-300/80 rounded-full bg-black/40 text-cyan-200 hover:bg-cyan-400/10 hover:shadow-[0_0_16px_rgba(34,211,238,0.6)] transition"
          >
            Go
          </button>

          {onSave && (
            <button
              onClick={handleSaveSnapshot}
              className="text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 border border-yellow-300/70 rounded-md bg-black/40 text-yellow-200 hover:bg-yellow-400/10 hover:shadow-[0_0_18px_rgba(234,179,8,0.6)] transition"
            >
              Save
            </button>
          )}

          <button
            onClick={onExit}
            className="text-slate-200 hover:text-white text-xs tracking-[0.18em] uppercase"
          >
            EXIT ✕
          </button>
        </div>
      </div>

      {/* INFO PANEL */}
      {info && (
        <div className="absolute right-4 bottom-4 w-80 max-h-[55vh] bg-black/88 border border-white/15 rounded-lg p-4 text-xs md:text-sm leading-relaxed backdrop-blur z-50 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[11px] tracking-[0.25em] uppercase text-slate-400">
              Node Insight
            </div>
            <button
              onClick={() => setInfo(null)}
              className="text-slate-300 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <div className="text-[11px] text-slate-400 mb-1 break-words">
            PATH: <span style={{ color: info.color }}>{info.path}</span>
          </div>
          <div
            className="text-sm font-semibold mb-2"
            style={{ color: info.color }}
          >
            {info.title}
          </div>
          <p className="text-[11px] md:text-xs text-slate-100 whitespace-pre-wrap">
            {info.text}
          </p>
        </div>
      )}

      {/* LOADING LABEL */}
      {loading && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] uppercase text-cyan-300 animate-pulse z-50">
          Expanding Neural Pathways…
        </div>
      )}
    </div>
  );
}
