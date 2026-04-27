"use client";

import { motion } from "framer-motion";
import { Code2, Sparkles } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 w-full"
    >
      <div className="glass-strong border-b border-violet-200/40">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-sky-500 shadow-lg shadow-violet-500/30 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Code<span className="gradient-text">Sage</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500">
                AI Code Reviewer
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-violet-700 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-violet-700 transition-colors">
              How it works
            </a>
            <a href="#analyze" className="hover:text-violet-700 transition-colors">
              Try it
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href="#analyze"
              className="flex items-center gap-2 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-50 hover:border-violet-300 transition-colors shadow-sm"
            >
              <Code2 className="h-4 w-4" />
              <span className="hidden sm:inline">Try now</span>
            </a>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
