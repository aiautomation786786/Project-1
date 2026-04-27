"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // next-themes only knows the resolved theme after hydration; we use a
    // mounted flag to avoid rendering mismatched icons on the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="glow-violet relative flex h-9 w-9 items-center justify-center rounded-lg border border-violet-200 bg-white text-slate-700 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm overflow-hidden"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ y: -16, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 16, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.22 }}
          className="flex"
        >
          {isDark ? (
            <Moon className="h-4 w-4" strokeWidth={2.2} />
          ) : (
            <Sun className="h-4 w-4" strokeWidth={2.2} />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
