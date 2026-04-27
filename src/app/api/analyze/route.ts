import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompt";
import type { AnalysisResult, AnalyzeResponse } from "@/lib/types";
import { chatCompletion } from "@/lib/llmClient";
import { getProvider, isProviderId, type ProviderId } from "@/lib/providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SERVER_FALLBACK_PROVIDER: ProviderId = "groq";
const SERVER_FALLBACK_MODEL =
  process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

interface AnalyzeBody {
  code?: unknown;
  language?: unknown;
  provider?: unknown;
  model?: unknown;
  apiKey?: unknown;
}

function tryParseJson(raw: string): AnalysisResult | null {
  let t = raw.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  }
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first === -1 || last === -1) return null;
  const sliced = t.slice(first, last + 1);
  try {
    return JSON.parse(sliced) as AnalysisResult;
  } catch {
    return null;
  }
}

function validate(result: unknown): result is AnalysisResult {
  if (!result || typeof result !== "object") return false;
  const r = result as Record<string, unknown>;
  return (
    typeof r.language === "string" &&
    typeof r.summary === "string" &&
    Array.isArray(r.bugs) &&
    typeof r.complexity === "object" &&
    typeof r.scores === "object" &&
    typeof r.optimizedCode === "string"
  );
}

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  let body: AnalyzeBody;
  try {
    body = (await req.json()) as AnalyzeBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code : "";
  const language =
    typeof body.language === "string" && body.language.length > 0
      ? body.language
      : "auto";

  if (!code.trim()) {
    return NextResponse.json(
      { ok: false, error: "Please paste some code to review." },
      { status: 400 },
    );
  }
  if (code.length > 20000) {
    return NextResponse.json(
      {
        ok: false,
        error: "Code is too long (max 20,000 characters). Please trim it down.",
      },
      { status: 400 },
    );
  }

  // BYOK: if the request supplies a provider + apiKey, honour it. Otherwise
  // fall back to the server's Groq key (the operator's account).
  const userProvider = isProviderId(body.provider) ? body.provider : null;
  const userApiKey =
    typeof body.apiKey === "string" && body.apiKey.trim().length > 0
      ? body.apiKey.trim()
      : null;
  const userModel =
    typeof body.model === "string" && body.model.trim().length > 0
      ? body.model.trim()
      : null;

  let provider: ProviderId;
  let model: string;
  let apiKey: string;

  if (userProvider && userApiKey) {
    provider = userProvider;
    const meta = getProvider(provider);
    model = userModel || meta?.defaultModel || "";
    apiKey = userApiKey;
  } else {
    const serverKey = process.env.GROQ_API_KEY;
    if (!serverKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "No API key. Open Settings (key icon in the header) and add a key from any supported provider.",
        },
        { status: 400 },
      );
    }
    provider = SERVER_FALLBACK_PROVIDER;
    model = SERVER_FALLBACK_MODEL;
    apiKey = serverKey;
  }

  let raw: string;
  try {
    const completion = await chatCompletion({
      provider,
      model,
      apiKey,
      temperature: 0.2,
      maxTokens: 8192,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(code, language) },
      ],
    });
    raw = completion.text;
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Something went wrong calling the AI provider.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }

  const parsed = tryParseJson(raw);
  if (!parsed || !validate(parsed)) {
    return NextResponse.json(
      {
        ok: false,
        error: "AI returned an unexpected response format. Please try again.",
      },
      { status: 502 },
    );
  }

  parsed.bugs = (parsed.bugs ?? []).map((b, i) => ({
    id: b.id || `bug-${i + 1}`,
    title: b.title || "Issue",
    severity: (["critical", "warning", "info"].includes(b.severity)
      ? b.severity
      : "info") as AnalysisResult["bugs"][number]["severity"],
    line: typeof b.line === "number" ? b.line : null,
    category: b.category || "General",
    description: b.description || "",
    why: b.why || "",
    fix: b.fix || "",
  }));
  parsed.scores = {
    overall: Number(parsed.scores?.overall ?? 0),
    readability: Number(parsed.scores?.readability ?? 0),
    performance: Number(parsed.scores?.performance ?? 0),
    security: Number(parsed.scores?.security ?? 0),
    maintainability: Number(parsed.scores?.maintainability ?? 0),
  };

  return NextResponse.json({ ok: true, data: parsed });
}
