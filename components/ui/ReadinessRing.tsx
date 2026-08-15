"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { readinessColor } from "@/lib/readiness";

const COLOR_HEX: Record<string, string> = {
  moss: "#7C9A79",
  ember: "#E2853D",
  rust: "#B4472A",
};

export default function ReadinessRing({ score }: { score: number | null }) {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const color = score != null ? readinessColor(score) : "rust";
  const hex = COLOR_HEX[color];

  useEffect(() => {
    if (score == null) return;
    const duration = 900;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [score]);

  const offset =
    score != null ? circumference - (displayScore / 100) * circumference : circumference;

  if (score == null) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <div className="w-32 h-32 rounded-full border-2 border-dashed border-iron flex items-center justify-center mb-3">
          <span className="font-mono text-[10px] text-bone-dim text-center px-4">
            check in
            <br />
            for a score
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="relative w-32 h-32">
        {/* glow layer — soft pulsing halo behind the ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 24px 4px ${hex}55` }}
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <svg width="128" height="128" viewBox="0 0 128 128" className="relative">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#2A2D36" strokeWidth="8" />
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={hex}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            transform="rotate(-90 64 64)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-3xl" style={{ color: hex }}>
            {displayScore}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wide text-bone-dim">
            readiness
          </span>
        </div>
      </div>
    </div>
  );
}
