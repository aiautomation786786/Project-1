/**
 * Provider-agnostic chat completion. Each provider is called via its public
 * REST API. The response is normalised to a single string payload (the
 * model's text output) which the route then parses as JSON.
 */

import type { ProviderId } from "./providers";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionParams {
  provider: ProviderId;
  model: string;
  apiKey: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface ChatCompletionResult {
  text: string;
}

const REQUEST_TIMEOUT_MS = 60_000;

async function postJson<T>(
  url: string,
  init: RequestInit,
  signal: AbortSignal,
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  let res: Response;
  try {
    res = await fetch(url, { ...init, signal });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return { ok: false, status: 0, error: msg };
  }
  const text = await res.text();
  if (!res.ok) {
    let detail = text;
    try {
      const j = JSON.parse(text);
      const errAny = (j as { error?: { message?: string } | string }).error;
      detail =
        typeof errAny === "string"
          ? errAny
          : (errAny?.message ?? text.slice(0, 400));
    } catch {
      // keep raw text
    }
    return { ok: false, status: res.status, error: detail };
  }
  try {
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    return { ok: false, status: 502, error: "Provider returned non-JSON response" };
  }
}

interface OpenAIChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

interface AnthropicMessageResponse {
  content?: Array<{ type: string; text?: string }>;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

export async function chatCompletion(
  params: ChatCompletionParams,
): Promise<ChatCompletionResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    switch (params.provider) {
      case "groq":
        return await callOpenAICompatible({
          ...params,
          baseUrl: "https://api.groq.com/openai/v1/chat/completions",
          signal: controller.signal,
        });
      case "openai":
        return await callOpenAICompatible({
          ...params,
          baseUrl: "https://api.openai.com/v1/chat/completions",
          signal: controller.signal,
        });
      case "deepseek":
        return await callOpenAICompatible({
          ...params,
          baseUrl: "https://api.deepseek.com/chat/completions",
          signal: controller.signal,
        });
      case "anthropic":
        return await callAnthropic(params, controller.signal);
      case "google":
        return await callGemini(params, controller.signal);
      default:
        throw new Error(`Unknown provider: ${params.provider as string}`);
    }
  } finally {
    clearTimeout(timer);
  }
}

async function callOpenAICompatible(
  params: ChatCompletionParams & { baseUrl: string; signal: AbortSignal },
): Promise<ChatCompletionResult> {
  const result = await postJson<OpenAIChatResponse>(
    params.baseUrl,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${params.apiKey}`,
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        temperature: params.temperature ?? 0.2,
        max_tokens: params.maxTokens ?? 4096,
        response_format: { type: "json_object" },
      }),
    },
    params.signal,
  );
  if (!result.ok) {
    throw new Error(friendlyError(result.status, result.error));
  }
  const text = result.data.choices?.[0]?.message?.content ?? "";
  return { text };
}

async function callAnthropic(
  params: ChatCompletionParams,
  signal: AbortSignal,
): Promise<ChatCompletionResult> {
  // Anthropic messages API: system is a top-level string, user/assistant in messages[].
  const system = params.messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");
  const conv = params.messages.filter((m) => m.role !== "system");
  // Prefill an opening brace to coax JSON-only output.
  if (
    conv.length === 0 ||
    conv[conv.length - 1].role !== "assistant"
  ) {
    conv.push({ role: "assistant", content: "{" });
  }
  const result = await postJson<AnthropicMessageResponse>(
    "https://api.anthropic.com/v1/messages",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": params.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: params.model,
        system,
        messages: conv,
        temperature: params.temperature ?? 0.2,
        max_tokens: params.maxTokens ?? 4096,
      }),
    },
    signal,
  );
  if (!result.ok) {
    throw new Error(friendlyError(result.status, result.error));
  }
  const blocks = result.data.content ?? [];
  const text = blocks
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("");
  // Re-attach the prefilled brace so the route parser sees a valid JSON object.
  return { text: text.trimStart().startsWith("{") ? text : "{" + text };
}

async function callGemini(
  params: ChatCompletionParams,
  signal: AbortSignal,
): Promise<ChatCompletionResult> {
  // Gemini REST: system_instruction is separate; user/model turns go in contents[].
  const system = params.messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");
  const contents = params.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(params.model)}:generateContent?key=${encodeURIComponent(params.apiKey)}`;
  const result = await postJson<GeminiResponse>(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: system ? { parts: [{ text: system }] } : undefined,
        contents,
        generationConfig: {
          temperature: params.temperature ?? 0.2,
          maxOutputTokens: params.maxTokens ?? 4096,
          responseMimeType: "application/json",
        },
      }),
    },
    signal,
  );
  if (!result.ok) {
    throw new Error(friendlyError(result.status, result.error));
  }
  const parts = result.data.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .map((p) => p.text ?? "")
    .join("");
  return { text };
}

function friendlyError(status: number, raw: string): string {
  const lower = raw.toLowerCase();
  if (status === 401 || status === 403 || lower.includes("unauthorized") || lower.includes("invalid api key") || lower.includes("api key")) {
    return "Invalid API key for the selected provider. Double-check the key in Settings.";
  }
  if (status === 429 || lower.includes("rate limit") || lower.includes("quota")) {
    return "Rate limit / quota exceeded on your provider account. Try again shortly or top up.";
  }
  if (status === 404 || lower.includes("model") && lower.includes("not")) {
    return "The selected model is not available on this provider account.";
  }
  if (status === 0) {
    return "Could not reach the provider. Check your network and try again.";
  }
  return raw.length > 280 ? raw.slice(0, 280) + "…" : raw;
}
