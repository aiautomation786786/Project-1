"use client";

import { motion } from "framer-motion";
import { ArrowDown, Bug, Cpu, Gauge, Sparkles, Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden pt-16 pb-12 sm:pt-24 sm:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-300/60 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-violet-700 backdrop-blur shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-600" />
            </span>
            AI-Powered Code Intelligence
          </motion.div>

          <h1 className="max-w-5xl text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            Find bugs.{" "}
            <span className="gradient-text">Understand them.</span>{" "}
            <br className="hidden sm:block" />
            Ship better code.
          </h1>

          <p className="mt-6 max-w-2xl text-balance text-base text-slate-600 sm:text-lg">
            Paste any code snippet — Codian&apos;s AI reviewer detects bugs,
            explains <em className="text-slate-900 not-italic font-semibold">why</em> they
            happen, analyses time and space complexity, and rewrites it the optimized
            way. Built for engineers and students who care about clean code.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#analyze"
              className="shine relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-violet-500/40 transition-transform hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4" />
              Analyze your code
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300 transition-colors shadow-sm"
            >
              How it works
              <ArrowDown className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            id="features"
            className="mt-16 grid w-full max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {[
              { icon: Bug, label: "Bug Detection", color: "text-rose-600", bg: "bg-rose-100" },
              { icon: Zap, label: "Why Explanations", color: "text-amber-600", bg: "bg-amber-100" },
              { icon: Gauge, label: "Big-O Analysis", color: "text-sky-600", bg: "bg-sky-100" },
              { icon: Cpu, label: "Optimized Code", color: "text-emerald-600", bg: "bg-emerald-100" },
            ].map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
                className="glass flex flex-col items-center gap-2 rounded-2xl p-4 transition-transform hover:scale-[1.02]"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${f.bg}`}>
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <span className="text-xs font-semibold text-slate-700">{f.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
