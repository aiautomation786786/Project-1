"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, AlertOctagon, AlertTriangle, Info } from "lucide-react";
import type { Bug } from "@/lib/types";
import { cn, severityColor } from "@/lib/utils";

const SEV_ICONS = {
  critical: AlertOctagon,
  warning: AlertTriangle,
  info: Info,
};

export function BugList({ bugs }: { bugs: Bug[] }) {
  if (!bugs.length) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
          <span className="text-2xl">✨</span>
        </div>
        <h3 className="text-lg font-semibold text-emerald-300">
          No bugs detected!
        </h3>
        <p className="mt-1 text-sm text-white/60">
          The AI reviewer didn&apos;t find any issues. Check the optimized code tab for
          stylistic improvements anyway.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {bugs.map((bug, i) => (
        <BugCard key={bug.id} bug={bug} index={i} />
      ))}
    </div>
  );
}

function BugCard({ bug, index }: { bug: Bug; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const Icon = SEV_ICONS[bug.severity] ?? Info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="glass overflow-hidden rounded-2xl"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1",
            severityColor(bug.severity),
          )}
        >
          <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-white">{bug.title}</h4>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold ring-1",
                severityColor(bug.severity),
              )}
            >
              {bug.severity}
            </span>
            {bug.line !== null && (
              <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-medium text-white/60">
                Line {bug.line}
              </span>
            )}
            <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-medium text-white/60">
              {bug.category}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-white/70">{bug.description}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-white/40 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="space-y-4 p-4">
              <div>
                <h5 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-violet-300">
                  Why this is a bug
                </h5>
                <p className="text-sm leading-relaxed text-white/80">{bug.why}</p>
              </div>
              <div>
                <h5 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                  How to fix
                </h5>
                <p className="text-sm leading-relaxed text-white/80">{bug.fix}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
