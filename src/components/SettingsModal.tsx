"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Lock,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  PROVIDERS,
  getProvider,
  type ProviderId,
} from "@/lib/providers";
import {
  clearSettings,
  describeSettings,
  hasUserKey,
  readSettings,
  writeSettings,
} from "@/lib/byokSettings";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  return (
    <AnimatePresence>
      {open && <SettingsModalContent onClose={onClose} />}
    </AnimatePresence>
  );
}

function SettingsModalContent({ onClose }: { onClose: () => void }) {
  // Lazy-initialise from localStorage on mount — avoids any setState-in-effect.
  const [provider, setProvider] = useState<ProviderId>(() => {
    const s = readSettings();
    return s.provider ?? "groq";
  });
  const [model, setModel] = useState<string>(() => {
    const s = readSettings();
    return s.model ?? getProvider(s.provider ?? "groq")?.defaultModel ?? "";
  });
  const [apiKey, setApiKey] = useState<string>(() => readSettings().apiKey ?? "");
  const [showKey, setShowKey] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Body scroll lock + Escape close — these write to non-React state so are valid effects.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const meta = useMemo(() => getProvider(provider), [provider]);

  const handleProvider = (id: ProviderId) => {
    setProvider(id);
    const m = getProvider(id);
    if (m) setModel(m.defaultModel);
  };

  const handleSave = () => {
    if (!apiKey.trim()) {
      clearSettings();
    } else {
      writeSettings({
        provider,
        model: model || meta?.defaultModel || null,
        apiKey: apiKey.trim(),
      });
    }
    setSavedAt(Date.now());
    setTimeout(onClose, 600);
  };

  const handleClear = () => {
    clearSettings();
    setApiKey("");
    setSavedAt(Date.now());
  };

  const live = readSettings();
  const currentlyActive = describeSettings(live);
  const usingKey = hasUserKey(live);

  return (
    <>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        key="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[81] flex items-start justify-center overflow-y-auto p-4 sm:p-8"
        onClick={onClose}
      >
        <div
          className="relative my-auto w-full max-w-2xl rounded-2xl border border-violet-200 bg-white shadow-2xl shadow-violet-500/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-violet-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-md shadow-violet-500/30">
                <KeyRound className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2
                  id="settings-title"
                  className="text-base font-semibold text-slate-900"
                >
                  AI Provider Settings
                </h2>
                <p className="text-[11px] text-slate-500">
                  Bring your own API key — pay nothing on this site.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close settings"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-5 px-6 py-5">
            {/* Privacy callout */}
            <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
              <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
              <div className="text-[12.5px] leading-relaxed text-emerald-800">
                Your API key is stored only in this browser&apos;s
                localStorage. It is sent with each analysis request to be
                forwarded to the selected provider — it is never logged or
                persisted on the server.
              </div>
            </div>

            {/* Provider grid */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Provider
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PROVIDERS.map((p) => {
                  const active = p.id === provider;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleProvider(p.id)}
                      className={`group relative flex flex-col items-start gap-0.5 rounded-xl border p-3 text-left transition-all ${
                        active
                          ? "border-violet-400 bg-violet-50 shadow-sm shadow-violet-200"
                          : "border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/40"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {p.label}
                        </span>
                        {active && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <span className="text-[11.5px] text-slate-500">
                        {p.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Model picker */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
              >
                {meta?.models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* API key */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  API Key
                </label>
                {meta && (
                  <a
                    href={meta.apiKeyDocsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11.5px] font-medium text-violet-700 hover:text-violet-900 hover:underline"
                  >
                    Get a key
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={meta?.apiKeyHint ?? "your API key"}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 font-mono text-sm text-slate-900 outline-none transition-colors placeholder:font-sans placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Status row */}
            <div className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-[12px] text-slate-600">
              <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
              <div>
                <span className="font-semibold text-slate-700">
                  Currently active:
                </span>{" "}
                {currentlyActive}
                {!usingKey && (
                  <>
                    {" "}
                    — you&apos;re using the site&apos;s shared key. Add your
                    own to use a different provider or model.
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear key
            </button>
            <div className="flex items-center gap-2">
              {savedAt && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                  <Check className="h-3 w-3" strokeWidth={3} />
                  Saved
                </span>
              )}
              <button
                onClick={onClose}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-violet-500/30 transition-all hover:brightness-110"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
