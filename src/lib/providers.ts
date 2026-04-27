/**
 * Provider catalogue for "Bring Your Own Key" support.
 *
 * Each provider is called via its public REST endpoint with the user's API key.
 * Keys live in the user's localStorage and are forwarded to the API route in the
 * request body — the server uses them ONCE for the upstream call and never logs
 * or persists them.
 */

export type ProviderId = "groq" | "openai" | "anthropic" | "google" | "deepseek";

export interface ProviderModel {
  id: string;
  label: string;
}

export interface Provider {
  id: ProviderId;
  label: string;
  shortLabel: string;
  models: ProviderModel[];
  defaultModel: string;
  apiKeyHint: string;
  apiKeyDocsUrl: string;
  description: string;
}

export const PROVIDERS: Provider[] = [
  {
    id: "groq",
    label: "Groq",
    shortLabel: "Groq",
    models: [
      { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
      { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B (fast)" },
    ],
    defaultModel: "llama-3.3-70b-versatile",
    apiKeyHint: "gsk_...",
    apiKeyDocsUrl: "https://console.groq.com/keys",
    description: "Fastest inference. Free tier available.",
  },
  {
    id: "openai",
    label: "OpenAI",
    shortLabel: "OpenAI",
    models: [
      { id: "gpt-4o-mini", label: "GPT-4o mini" },
      { id: "gpt-4o", label: "GPT-4o" },
    ],
    defaultModel: "gpt-4o-mini",
    apiKeyHint: "sk-...",
    apiKeyDocsUrl: "https://platform.openai.com/api-keys",
    description: "Industry-standard. Best at strict JSON.",
  },
  {
    id: "anthropic",
    label: "Anthropic (Claude)",
    shortLabel: "Claude",
    models: [
      { id: "claude-3-5-haiku-latest", label: "Claude 3.5 Haiku" },
      { id: "claude-3-5-sonnet-latest", label: "Claude 3.5 Sonnet" },
    ],
    defaultModel: "claude-3-5-haiku-latest",
    apiKeyHint: "sk-ant-...",
    apiKeyDocsUrl: "https://console.anthropic.com/settings/keys",
    description: "Strongest at deep code reasoning.",
  },
  {
    id: "google",
    label: "Google Gemini",
    shortLabel: "Gemini",
    models: [
      { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
      { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    ],
    defaultModel: "gemini-1.5-flash",
    apiKeyHint: "AIza...",
    apiKeyDocsUrl: "https://aistudio.google.com/apikey",
    description: "Generous free tier. Long context.",
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    shortLabel: "DeepSeek",
    models: [
      { id: "deepseek-chat", label: "DeepSeek Chat" },
      { id: "deepseek-reasoner", label: "DeepSeek R1 (reasoning)" },
    ],
    defaultModel: "deepseek-chat",
    apiKeyHint: "sk-...",
    apiKeyDocsUrl: "https://platform.deepseek.com/api_keys",
    description: "Affordable. Reasoning mode for hard cases.",
  },
];

export function getProvider(id: ProviderId): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export function isProviderId(value: unknown): value is ProviderId {
  return (
    typeof value === "string" &&
    (PROVIDERS as { id: string }[]).some((p) => p.id === value)
  );
}
