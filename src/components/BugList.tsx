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
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <span className="text-2xl">✨</span>
        </div>
        <h3 className="text-lg font-semibold text-emerald-700">
          No bugs detected!
        </h3>
        <p className="mt-1 text-sm text-slate-600">
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="glass card-lift overflow-hidden rounded-2xl"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-4 text-left hover:bg-violet-50/60 transition-colors"
      >
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 transition-transform group-hover:scale-105",
            severityColor(bug.severity),
            bug.severity === "critical" && "pulse-dot",
          )}
        >
          <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-slate-900">{bug.title}</h4>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-bold ring-1",
                severityColor(bug.severity),
              )}
            >
              {bug.severity}
            </span>
            {bug.line !== null && (
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold text-slate-600 ring-1 ring-slate-200">
                Line {bug.line}
              </span>
            )}
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold text-slate-600 ring-1 ring-slate-200">
              {bug.category}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-700">{bug.description}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-slate-400 transition-transform",
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
            className="overflow-hidden border-t border-violet-200/50"
          >
            <div className="space-y-4 p-4">
              <div>
                <h5 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-violet-700">
                  Why this is a bug
                </h5>
                <p className="text-sm leading-relaxed text-slate-700">{bug.why}</p>
              </div>
              <div>
                <h5 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                  How to fix
                </h5>
                <p className="text-sm leading-relaxed text-slate-700">{bug.fix}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
