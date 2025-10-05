"use client";
import React, { useEffect, useMemo, useState } from "react";

type LogoSpec = {
  top: number; // 0..100 vh
  left: number; // 0..100 vw
  size: number; // px
  opacity: number; // 0..1
  duration: number; // s
  delay: number; // s
  rotate: number; // deg
};

function seededRandom(seed: number) {
  // simple LCG for deterministic positions per mount
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff;
}

export default function FloatingLogos({ count = 24, fixed = true }: { count?: number; fixed?: boolean }) {
  const [seed] = useState(() => Math.floor(Math.random() * 1e9));
  const list = useMemo<LogoSpec[]>(() => {
    const rnd = seededRandom(seed);
    const specs: LogoSpec[] = [];
    for (let i = 0; i < count; i++) {
      const size = 20 + Math.floor(rnd() * 50); // 20..70px
      const opacity = 0.05 + rnd() * 0.12; // subtle
      const duration = 6 + rnd() * 8; // 6..14s
      const delay = rnd() * 6; // 0..6s
      const rotate = -8 + rnd() * 16; // -8..8deg
      const top = rnd() * 100; // 0..100vh
      const left = rnd() * 100; // 0..100vw
      specs.push({ size, opacity, duration, delay, rotate, top, left });
    }
    return specs;
  }, [count, seed]);

  return (
    <div className={`${fixed ? "fixed" : "absolute"} inset-0 pointer-events-none select-none z-0 overflow-hidden`}
         aria-hidden>
      {list.map((l, idx) => (
        <img
          key={idx}
          src="/logo-192.png"
          alt=""
          className="absolute animate-floaty will-change-transform"
          style={{
            top: `${l.top}%`,
            left: `${l.left}%`,
            width: `${l.size}px`,
            height: `${l.size}px`,
            opacity: l.opacity,
            animationDuration: `${l.duration}s`,
            animationDelay: `${l.delay}s`,
            transform: `translate(-50%, -50%) rotate(${l.rotate}deg)`
          }}
        />
      ))}
    </div>
  );
}
