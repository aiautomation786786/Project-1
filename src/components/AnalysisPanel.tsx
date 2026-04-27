"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Bug as BugIcon,
  Gauge,
  Sparkles,
  Wand2,
  Copy,
  Check,
  Download,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { cn, scoreColor } from "@/lib/utils";
import { BugList } from "./BugList";
import { ScoreRing } from "./ScoreRing";
import { CodeEditor } from "./CodeEditor";

type Tab = "overview" | "bugs" | "complexity" | "optimized";

const TABS: { id: Tab; label: string; icon: typeof BugIcon }[] = [
  { id: "overview", label: "Overview", icon: Sparkles },
  { id: "bugs", label: "Bugs", icon: BugIcon },
  { id: "complexity", label: "Complexity", icon: Gauge },
  { id: "optimized", label: "Optimized", icon: Wand2 },
];

interface Props {
  result: AnalysisResult;
}

export function AnalysisPanel({ result }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.optimizedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadReport = () => {
    const md = buildMarkdownReport(result);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codesage-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-strong flex h-full flex-col overflow-hidden rounded-2xl"
    >
      <div className="flex items-center justify-between border-b border-violet-200/50 px-4 py-3">
        <div className="flex flex-wrap items-center gap-1">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "text-violet-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-violet-50",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-100 to-fuchsia-100 ring-1 ring-violet-300"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <t.icon className="relative h-3.5 w-3.5" />
                <span className="relative">{t.label}</span>
                {t.id === "bugs" && result.bugs.length > 0 && (
                  <span className="relative rounded-full bg-rose-100 px-1.5 text-[10px] font-bold text-rose-700 ring-1 ring-rose-300">
                    {result.bugs.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <button
          onClick={handleDownloadReport}
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300 transition-colors"
          title="Download analysis as Markdown"
        >
          <Download className="h-3.5 w-3.5" />
          Report
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <ScoreRing score={result.scores.overall} label="Overall" />
                <div className="flex-1">
                  <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-bold text-violet-700">
                    {result.language}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Summary</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                    {result.summary}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { k: "readability", label: "Readable" },
                  { k: "performance", label: "Fast" },
                  { k: "security", label: "Secure" },
                  { k: "maintainability", label: "Maintain" },
                ].map((s) => {
                  const val =
                    result.scores[s.k as keyof typeof result.scores] ?? 0;
                  return (
                    <div
                      key={s.k}
                      className="glass rounded-xl p-3 text-center"
                    >
                      <div
                        className={`text-2xl font-bold ${scoreColor(val)}`}
                      >
                        {val}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                        {s.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="glass rounded-xl p-4">
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-slate-500">
                  <Gauge className="h-3.5 w-3.5" />
                  Complexity at a glance
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-lg bg-sky-100 px-2.5 py-1 text-sm font-mono font-bold text-sky-700 ring-1 ring-sky-300">
                    Time {result.complexity.time}
                  </span>
                  <span className="rounded-lg bg-violet-100 px-2.5 py-1 text-sm font-mono font-bold text-violet-700 ring-1 ring-violet-300">
                    Space {result.complexity.space}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 ring-1 ring-violet-200/60">
                <div className="mb-1.5 text-xs uppercase tracking-widest font-bold text-slate-500">
                  Issues found
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {result.bugs.length}{" "}
                  <span className="text-base font-medium text-slate-500">
                    {result.bugs.length === 1 ? "issue" : "issues"}
                  </span>
                </div>
                <button
                  onClick={() => setTab("bugs")}
                  className="mt-2 text-xs font-semibold text-violet-700 hover:text-violet-900 transition-colors"
                >
                  See all bugs →
                </button>
              </div>
            </motion.div>
          )}

          {tab === "bugs" && (
            <motion.div
              key="bugs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <BugList bugs={result.bugs} />
            </motion.div>
          )}

          {tab === "complexity" && (
            <motion.div
              key="complexity"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="glass rounded-xl p-4">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                    Time complexity
                  </div>
                  <div className="mt-1 font-mono text-3xl font-bold text-sky-700">
                    {result.complexity.time}
                  </div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                    Space complexity
                  </div>
                  <div className="mt-1 font-mono text-3xl font-bold text-violet-700">
                    {result.complexity.space}
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-4">
                <h4 className="mb-2 text-xs uppercase tracking-widest font-bold text-slate-500">
                  Explanation
                </h4>
                <p className="text-sm leading-relaxed text-slate-700">
                  {result.complexity.explanation}
                </p>
              </div>

              {result.complexity.bottleneck && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
                  <h4 className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-amber-700">
                    <Gauge className="h-3.5 w-3.5" />
                    Bottleneck
                  </h4>
                  <p className="text-sm leading-relaxed text-amber-900">
                    {result.complexity.bottleneck}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {tab === "optimized" && (
            <motion.div
              key="optimized"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">
                  Optimized version
                </h4>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <CodeEditor
                value={result.optimizedCode}
                onChange={() => {}}
                language={result.language}
                readOnly
                height="320px"
              />
              {result.optimizedCodeNotes && (
                <div className="glass rounded-xl p-4">
                  <h4 className="mb-2 text-xs uppercase tracking-widest font-bold text-slate-500">
                    What changed
                  </h4>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
                    {result.optimizedCodeNotes}
                  </pre>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function buildMarkdownReport(r: AnalysisResult): string {
  const lines: string[] = [];
  lines.push(`# CodeSage Analysis Report`);
  lines.push("");
  lines.push(`**Language:** ${r.language}`);
  lines.push("");
  lines.push(`## Summary`);
  lines.push(r.summary);
  lines.push("");
  lines.push(`## Quality Scores`);
  lines.push(`- Overall: **${r.scores.overall}/100**`);
  lines.push(`- Readability: ${r.scores.readability}/100`);
  lines.push(`- Performance: ${r.scores.performance}/100`);
  lines.push(`- Security: ${r.scores.security}/100`);
  lines.push(`- Maintainability: ${r.scores.maintainability}/100`);
  lines.push("");
  lines.push(`## Complexity`);
  lines.push(`- Time: \`${r.complexity.time}\``);
  lines.push(`- Space: \`${r.complexity.space}\``);
  lines.push("");
  lines.push(r.complexity.explanation);
  if (r.complexity.bottleneck) {
    lines.push("");
    lines.push(`**Bottleneck:** ${r.complexity.bottleneck}`);
  }
  lines.push("");
  lines.push(`## Bugs (${r.bugs.length})`);
  for (const b of r.bugs) {
    lines.push("");
    lines.push(
      `### ${b.title} _(${b.severity}${b.line !== null ? `, line ${b.line}` : ""})_`,
    );
    lines.push(`**Category:** ${b.category}`);
    lines.push("");
    lines.push(b.description);
    lines.push("");
    lines.push(`**Why:** ${b.why}`);
    lines.push("");
    lines.push(`**Fix:** ${b.fix}`);
  }
  lines.push("");
  lines.push(`## Optimized Code`);
  lines.push("```" + r.language);
  lines.push(r.optimizedCode);
  lines.push("```");
  lines.push("");
  lines.push(`### Notes`);
  lines.push(r.optimizedCodeNotes);
  return lines.join("\n");
}
