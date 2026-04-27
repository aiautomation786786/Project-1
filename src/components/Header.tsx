"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Code2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { SettingsButton } from "./SettingsButton";

export function Header() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 24);
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 w-full"
    >
      <div
        className={`glass-strong border-b border-violet-200/40 transition-all duration-300 ${
          scrolled ? "header-scrolled" : ""
        }`}
      >
        <div
          className={`mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
            scrolled ? "h-14" : "h-16"
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-sky-500 shadow-lg shadow-violet-500/30"
            >
              <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-sky-500 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-70" />
              <Sparkles className="relative h-5 w-5 text-white" strokeWidth={2.5} />
            </motion.div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Cod<span className="gradient-text">ian</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500">
                AI Code Reviewer
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            {[
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How it works" },
              { href: "#analyze", label: "Try it" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative transition-colors hover:text-violet-700 group/nav"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-300 group-hover/nav:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <SettingsButton />
            <ThemeToggle />
            <a
              href="#analyze"
              className="glow-violet hidden md:flex items-center gap-2 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-50 hover:border-violet-300 transition-colors shadow-sm"
            >
              <Code2 className="h-4 w-4" />
              <span>Try now</span>
            </a>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
