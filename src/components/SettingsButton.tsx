"use client";

import { KeyRound } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import {
  describeSettings,
  hasUserKey,
  readSettings,
  subscribeSettings,
  type ByokSettings,
} from "@/lib/byokSettings";
import { SettingsModal } from "./SettingsModal";

const EMPTY: ByokSettings = { provider: null, model: null, apiKey: null };

function getSnapshot(): ByokSettings {
  return readSettings();
}

function getServerSnapshot(): ByokSettings {
  return EMPTY;
}

export function SettingsButton() {
  const [open, setOpen] = useState(false);
  const settings = useSyncExternalStore(
    subscribeSettings,
    getSnapshot,
    getServerSnapshot,
  );

  const using = hasUserKey(settings);
  const label = using ? describeSettings(settings) : "Add your API key";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={using ? `Using ${label}` : "Bring your own API key"}
        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
          using
            ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            : "border-violet-200 bg-white text-slate-700 hover:bg-violet-50 hover:border-violet-300"
        }`}
      >
        <KeyRound className="h-3.5 w-3.5" strokeWidth={2.5} />
        <span className="hidden sm:inline">
          {using ? label : "API key"}
        </span>
      </button>
      <SettingsModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
