"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Upload,
  Trash2,
  Loader2,
  AlertCircle,
  FileCode,
  ChevronDown,
} from "lucide-react";
import { CodeEditor } from "./CodeEditor";
import { AnalysisPanel } from "./AnalysisPanel";
import {
  SUPPORTED_LANGUAGES,
  type AnalysisResult,
  type AnalyzeResponse,
  type SupportedLanguage,
} from "@/lib/types";

const SAMPLES: Record<string, { language: SupportedLanguage; code: string }> = {
  "Python — buggy fibonacci": {
    language: "python",
    code: `def fibonacci(n):
    if n == 0:
        return 0
    if n == 1:
        return 1
    return fibonacci(n - 1) + fibonacci(n - 2)


def average(numbers):
    total = 0
    for i in range(1, len(numbers)):
        total += numbers[i]
    return total / len(numbers)


print(fibonacci(35))
print(average([10, 20, 30, 40, 50]))
`,
  },
  "JavaScript — async race": {
    language: "javascript",
    code: `function getUser(id) {
  fetch('/api/users/' + id)
    .then(res => res.json())
    .then(data => {
      console.log("user:", data);
      return data;
    });
}

const users = [];
for (var i = 0; i < 5; i++) {
  setTimeout(function() {
    users.push(i);
    console.log("pushed:", i);
  }, 100);
}
console.log("final:", users);
`,
  },
  "C++ — buffer overflow": {
    language: "cpp",
    code: `#include <iostream>
#include <cstring>

int main() {
    char buffer[8];
    char input[100];
    std::cin >> input;
    strcpy(buffer, input);
    std::cout << "Hello, " << buffer << std::endl;

    int* p = new int(42);
    std::cout << *p << std::endl;
    return 0;
}
`,
  },
};

export function CodeReviewer() {
  const [code, setCode] = useState<string>(SAMPLES["Python — buggy fibonacci"].code);
  const [language, setLanguage] = useState<SupportedLanguage>("python");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showSamples, setShowSamples] = useState(false);

  const analyze = useCallback(async () => {
    if (!code.trim()) {
      setError("Paste some code first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = (await res.json()) as AnalyzeResponse;
      if (!data.ok || !data.data) {
        throw new Error(data.error ?? "Analysis failed");
      }
      setResult(data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [code, language]);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCode(String(reader.result ?? ""));
      const ext = file.name.split(".").pop()?.toLowerCase();
      const map: Record<string, SupportedLanguage> = {
        py: "python",
        js: "javascript",
        jsx: "javascript",
        ts: "typescript",
        tsx: "typescript",
        java: "java",
        c: "c",
        cpp: "cpp",
        cc: "cpp",
        cxx: "cpp",
        h: "cpp",
        hpp: "cpp",
        cs: "csharp",
        go: "go",
        rs: "rust",
        rb: "ruby",
        php: "php",
        swift: "swift",
        kt: "kotlin",
        sql: "sql",
      };
      if (ext && map[ext]) setLanguage(map[ext]);
    };
    reader.readAsText(file);
  };

  return (
    <section
      id="analyze"
      className="relative w-full pt-4 pb-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
          {/* Editor card */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-strong flex flex-col overflow-hidden rounded-2xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-violet-200/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-md shadow-violet-500/30">
                  <FileCode className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold leading-tight text-slate-900">Your code</h3>
                  <p className="text-[11px] text-slate-500">
                    {code.length.toLocaleString()} chars · {code.split("\n").length}{" "}
                    lines
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="rounded-lg border border-violet-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none transition-colors hover:bg-violet-50 focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l === "auto" ? "Auto-detect" : l}
                    </option>
                  ))}
                </select>
                <div className="relative">
                  <button
                    onClick={() => setShowSamples((v) => !v)}
                    className="flex items-center gap-1 rounded-lg border border-violet-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-violet-50 transition-colors"
                  >
                    Samples
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <AnimatePresence>
                    {showSamples && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute right-0 top-full z-50 mt-1.5 w-64 overflow-hidden rounded-xl border border-violet-200 bg-white p-1 shadow-xl ring-1 ring-violet-200/50"
                      >
                        {Object.entries(SAMPLES).map(([name, s]) => (
                          <button
                            key={name}
                            onClick={() => {
                              setCode(s.code);
                              setLanguage(s.language);
                              setShowSamples(false);
                            }}
                            className="block w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700"
                          >
                            {name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <label className="flex cursor-pointer items-center gap-1 rounded-lg border border-violet-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-violet-50 transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                  <input
                    type="file"
                    accept=".py,.js,.jsx,.ts,.tsx,.java,.c,.cpp,.cc,.cxx,.h,.hpp,.cs,.go,.rs,.rb,.php,.swift,.kt,.sql,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>
                <button
                  onClick={() => setCode("")}
                  className="flex items-center gap-1 rounded-lg border border-violet-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
                  title="Clear editor"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="p-3">
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language === "auto" ? "javascript" : language}
                height="440px"
              />
            </div>

            <div className="border-t border-violet-200/50 p-4">
              <button
                onClick={analyze}
                disabled={loading || !code.trim()}
                className="btn-primary shine relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing your code…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Review my code
                  </>
                )}
              </button>
              <p className="mt-2 text-center text-[11px] text-slate-500">
                Press the button — analysis takes a few seconds. Up to 20,000 chars.
              </p>
            </div>
          </motion.div>

          {/* Analysis card */}
          <div className="min-h-[600px]">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="glass-strong flex h-full flex-col items-center justify-center rounded-2xl p-8 text-center"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                    <AlertCircle className="h-6 w-6 text-rose-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-rose-700">
                    Couldn&apos;t analyse
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-slate-600">{error}</p>
                  <button
                    onClick={analyze}
                    className="mt-4 rounded-lg border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 transition-colors"
                  >
                    Retry
                  </button>
                </motion.div>
              )}

              {!error && loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-strong flex h-full flex-col items-center justify-center rounded-2xl p-8 text-center"
                >
                  <div className="relative mb-4">
                    <div className="absolute inset-0 animate-ping rounded-full bg-violet-400/40" />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-xl shadow-violet-500/40">
                      <Sparkles className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Codian is thinking…</h3>
                  <p className="mt-1 max-w-sm text-sm text-slate-600">
                    Reading your code, hunting for bugs, calculating complexity, and
                    drafting an optimized version.
                  </p>
                  <div className="mt-5 flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-2 rounded-full bg-violet-500"
                        style={{
                          animation: `bounce 1s infinite ease-in-out ${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                  <style>{`@keyframes bounce {0%,80%,100%{transform:scale(0.6);opacity:0.5}40%{transform:scale(1);opacity:1}}`}</style>
                </motion.div>
              )}

              {!loading && !error && result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <AnalysisPanel result={result} />
                </motion.div>
              )}

              {!loading && !error && !result && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-strong flex h-full flex-col items-center justify-center rounded-2xl p-8 text-center"
                >
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 ring-1 ring-violet-300/60">
                    <Sparkles className="h-6 w-6 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Ready to review</h3>
                  <p className="mt-1 max-w-sm text-sm text-slate-600">
                    Paste your code on the left, pick a language, then hit{" "}
                    <em className="not-italic font-semibold text-slate-900">
                      Review my code
                    </em>{" "}
                    — you&apos;ll get bugs, Big-O complexity, a quality score, and an
                    optimized version explained step by step.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
