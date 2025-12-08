"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// ✅ Ab spline import hata diya – apna custom wormhole curve banaenge
// import spline from "./spline";

export default function WormholeScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    // Scene + camera + renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.25);

    const camera = new THREE.PerspectiveCamera(70, w / h, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.03;

    // -------- POST PROCESSING (Bloom) ----------
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      1.5,
      0.4,
      100
    );
    bloomPass.threshold = 0.001;
    bloomPass.strength = 2;   // brighter glow
bloomPass.radius = 0.3;     // smoother bloom spread


    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // -------- CUSTOM WORMHOLE CURVE ----------
    class WormCurve extends THREE.Curve {
      constructor() {
        super();
      }
      getPoint(t, optionalTarget = new THREE.Vector3()) {
        // t: 0 → 1
        const turns = 4; // kitne chakkar
        const angle = t * Math.PI * 2 * turns;
        const radius = 4.5 + Math.sin(t * Math.PI * 6) * 0.4; // thoda wobble
        const z = (t - 0.5) * 40; // aage/peeche depth

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.8;

        optionalTarget.set(x, y, z);
        return optionalTarget;
      }
    }

    const path = new WormCurve();

    // Tunnel tube from curve
    const tubeGeo = new THREE.TubeGeometry(path, 200, 2, 10, true);
    const edges = new THREE.EdgesGeometry(tubeGeo, 0.2);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xE6A3E1 , });
    const tubeLines = new THREE.LineSegments(edges, lineMat);
    scene.add(tubeLines);

    // -------- FLOATING BOX WIREFRAMES ----------
    const numBoxes = 1000;
    const size = 0.08;
    const boxGeo = new THREE.BoxGeometry(size, size, size);

    for (let i = 0; i < numBoxes; i++) {
      const p = (i / numBoxes + Math.random() * 0.12) % 1;
      const pos = path.getPointAt(p).clone();

      pos.x += (Math.random() - 0.5) * 1.2;
      pos.y += (Math.random() - 0.5) * 1.2;

      const rot = new THREE.Vector3(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      const edgesGeo = new THREE.EdgesGeometry(boxGeo, 0.2);
      const color = new THREE.Color().setHSL(0.82 - p * 0.15, 1, 0.6);
      const wireMat = new THREE.LineBasicMaterial({ color });
      const boxLines = new THREE.LineSegments(edgesGeo, wireMat);
      boxLines.position.copy(pos);
      boxLines.rotation.set(rot.x, rot.y, rot.z);
      scene.add(boxLines);
    }

    // -------- CAMERA FLYTHROUGH ----------
    const start = performance.now();

    function updateCamera(timeMs) {
      const elapsed = timeMs - start;
      const loopTime = 50 * 1000;
      const t = (elapsed % loopTime) / loopTime; // 0..1

      const pos = path.getPointAt(t);
      const lookAt = path.getPointAt((t + 0.02) % 1);

      camera.position.copy(pos);
      camera.lookAt(lookAt);
    }

    let frameId;
    const animate = (time = 0) => {
      frameId = requestAnimationFrame(animate);
      updateCamera(time);
      controls.update();
      composer.render(scene, camera);
    };
    animate();

    function handleResize() {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      composer.setSize(nw, nh);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      composer.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
