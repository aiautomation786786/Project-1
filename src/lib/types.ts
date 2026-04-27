export type Severity = "critical" | "warning" | "info";

export interface Bug {
  id: string;
  title: string;
  severity: Severity;
  line: number | null;
  category: string;
  description: string;
  why: string;
  fix: string;
}

export interface ComplexityAnalysis {
  time: string;
  space: string;
  explanation: string;
  bottleneck: string | null;
}

export interface QualityScores {
  overall: number;
  readability: number;
  performance: number;
  security: number;
  maintainability: number;
}

export interface AnalysisResult {
  language: string;
  summary: string;
  bugs: Bug[];
  complexity: ComplexityAnalysis;
  scores: QualityScores;
  optimizedCode: string;
  optimizedCodeNotes: string;
}

export interface AnalyzeRequest {
  code: string;
  language?: string;
}

export interface AnalyzeResponse {
  ok: boolean;
  data?: AnalysisResult;
  error?: string;
}

export const SUPPORTED_LANGUAGES = [
  "auto",
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "c",
  "csharp",
  "go",
  "rust",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "sql",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
