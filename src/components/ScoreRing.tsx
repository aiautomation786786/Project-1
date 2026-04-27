"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { scoreColor, scoreRingColor } from "@/lib/utils";

interface Props {
  score: number;
  label?: string;
  size?: number;
}

export function ScoreRing({ score, label = "Overall", size = 140 }: Props) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Animated count-up: motion value 0 → score over ~1.2s, displayed as integer.
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, score, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [score, count, rounded]);

  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={8}
          className="fill-none stroke-slate-200"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={8}
          strokeLinecap="round"
          className={`fill-none ${scoreRingColor(score)}`}
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`text-3xl font-bold tabular-nums ${scoreColor(score)}`}
        >
          {display}
        </motion.span>
        <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">
          {label}
        </span>
      </div>
    </div>
  );
}
