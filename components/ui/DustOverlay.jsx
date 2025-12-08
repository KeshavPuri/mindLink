"use client";

import { useMemo } from "react";

// Bright visible dust / glow particles overlay
export default function DustOverlay() {
  const particles = useMemo(
    () =>
      Array.from({ length: 90 }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 2.5 + Math.random() * 3.5,
        duration: 16 + Math.random() * 10,
        delay: Math.random() * -20,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="dust-particle"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
