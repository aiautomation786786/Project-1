"use client";

import { isProviderId, getProvider, type ProviderId } from "./providers";

export interface ByokSettings {
  provider: ProviderId | null;
  model: string | null;
  apiKey: string | null;
}

const KEYS = {
  provider: "codian:provider",
  model: "codian:model",
  apiKey: "codian:apiKey",
} as const;

const SETTINGS_EVENT = "codian:settings-changed";

const EMPTY: ByokSettings = { provider: null, model: null, apiKey: null };

// Cache the last-returned object so `readSettings()` is referentially stable
// when nothing has changed — required for `useSyncExternalStore`'s contract.
let cached: ByokSettings = EMPTY;

export function readSettings(): ByokSettings {
  if (typeof window === "undefined") {
    return EMPTY;
  }
  let next: ByokSettings;
  try {
    const provider = window.localStorage.getItem(KEYS.provider);
    const model = window.localStorage.getItem(KEYS.model);
    const apiKey = window.localStorage.getItem(KEYS.apiKey);
    next = {
      provider: isProviderId(provider) ? provider : null,
      model: model && model.length > 0 ? model : null,
      apiKey: apiKey && apiKey.length > 0 ? apiKey : null,
    };
  } catch {
    next = EMPTY;
  }
  if (
    cached.provider === next.provider &&
    cached.model === next.model &&
    cached.apiKey === next.apiKey
  ) {
    return cached;
  }
  cached = next;
  return cached;
}

export function writeSettings(next: ByokSettings) {
  if (typeof window === "undefined") return;
  try {
    if (next.provider) {
      window.localStorage.setItem(KEYS.provider, next.provider);
    } else {
      window.localStorage.removeItem(KEYS.provider);
    }
    if (next.model) {
      window.localStorage.setItem(KEYS.model, next.model);
    } else {
      window.localStorage.removeItem(KEYS.model);
    }
    if (next.apiKey) {
      window.localStorage.setItem(KEYS.apiKey, next.apiKey);
    } else {
      window.localStorage.removeItem(KEYS.apiKey);
    }
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT));
  } catch {
    // localStorage might be disabled (private mode); just no-op.
  }
}

export function clearSettings() {
  writeSettings({ provider: null, model: null, apiKey: null });
}

export function subscribeSettings(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onCustom = () => handler();
  const onStorage = (e: StorageEvent) => {
    if (
      e.key === KEYS.provider ||
      e.key === KEYS.model ||
      e.key === KEYS.apiKey
    ) {
      handler();
    }
  };
  window.addEventListener(SETTINGS_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(SETTINGS_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

export function hasUserKey(s: ByokSettings): boolean {
  return Boolean(s.provider && s.apiKey);
}

export function describeSettings(s: ByokSettings): string {
  if (!hasUserKey(s) || !s.provider) return "Default (server key)";
  const meta = getProvider(s.provider);
  const modelLabel =
    meta?.models.find((m) => m.id === s.model)?.label ??
    meta?.models.find((m) => m.id === meta.defaultModel)?.label ??
    s.model ??
    "default";
  return `${meta?.shortLabel ?? s.provider} · ${modelLabel}`;
}
