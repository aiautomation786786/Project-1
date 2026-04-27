"use client";

import { motion } from "framer-motion";
import { ClipboardPaste, BrainCircuit, FileText } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardPaste,
    title: "1. Paste your code",
    body:
      "Drop in a snippet (or upload a file). CodeSage supports 15+ languages including Python, JS/TS, Java, C/C++, Go and Rust.",
    color: "from-violet-600 to-fuchsia-500",
  },
  {
    icon: BrainCircuit,
    title: "2. AI reviews it",
    body:
      "Llama 3.3 70B (via Groq) reads it like a senior engineer — finds bugs, explains why they happen, and rewrites the code.",
    color: "from-sky-600 to-cyan-500",
  },
  {
    icon: FileText,
    title: "3. Learn & improve",
    body:
      "Browse bugs by severity, see Big-O complexity, copy the optimized version, or download the full report as PDF.",
    color: "from-emerald-600 to-lime-500",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative w-full py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            How <span className="gradient-text">CodeSage</span> works
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
            From paste to professional review in under 10 seconds.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass relative overflow-hidden rounded-2xl p-6"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} shadow-lg`}
              >
                <s.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
