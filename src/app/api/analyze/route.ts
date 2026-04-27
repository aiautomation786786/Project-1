import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompt";
import type { AnalysisResult, AnalyzeRequest, AnalyzeResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function getGroq() {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error(
      "GROQ_API_KEY is not configured on the server. Add it to your .env.local file.",
    );
  }
  return new Groq({ apiKey: key });
}

function tryParseJson(raw: string): AnalysisResult | null {
  // Strip code fences if any
  let t = raw.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  }
  // Find first { and last }
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
  let body: AnalyzeRequest;
  try {
    body = (await req.json()) as AnalyzeRequest;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const code = (body.code ?? "").toString();
  const language = (body.language ?? "auto").toString();

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

  let groq: Groq;
  try {
    groq = getGroq();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server misconfigured";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(code, language) },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
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

    // Defensive normalization
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
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Something went wrong calling the AI provider.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
