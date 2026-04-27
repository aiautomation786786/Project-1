"use client";

import jsPDF from "jspdf";
import type { AnalysisResult } from "./types";

const COLORS = {
  violet: [124, 58, 237] as [number, number, number],
  fuchsia: [219, 39, 119] as [number, number, number],
  sky: [2, 132, 199] as [number, number, number],
  emerald: [5, 150, 105] as [number, number, number],
  amber: [217, 119, 6] as [number, number, number],
  rose: [225, 29, 72] as [number, number, number],
  slate900: [15, 23, 42] as [number, number, number],
  slate700: [51, 65, 85] as [number, number, number],
  slate500: [100, 116, 139] as [number, number, number],
  slate200: [226, 232, 240] as [number, number, number],
  slate100: [241, 245, 249] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN_X = 48;
const FOOTER_Y = PAGE_H - 32;

interface Cursor {
  doc: jsPDF;
  y: number;
  page: number;
}

function setFill(c: Cursor, color: [number, number, number]) {
  c.doc.setFillColor(color[0], color[1], color[2]);
}
function setStroke(c: Cursor, color: [number, number, number]) {
  c.doc.setDrawColor(color[0], color[1], color[2]);
}
function setText(c: Cursor, color: [number, number, number]) {
  c.doc.setTextColor(color[0], color[1], color[2]);
}

function addFooter(c: Cursor) {
  setText(c, COLORS.slate500);
  c.doc.setFont("helvetica", "normal");
  c.doc.setFontSize(9);
  c.doc.text("Codian — AI Code Reviewer & Bug Explainer", MARGIN_X, FOOTER_Y);
  c.doc.text(`Page ${c.page}`, PAGE_W - MARGIN_X, FOOTER_Y, { align: "right" });
}

function newPage(c: Cursor) {
  addFooter(c);
  c.doc.addPage();
  c.page += 1;
  c.y = MARGIN_X + 16;
}

function ensureSpace(c: Cursor, needed: number) {
  if (c.y + needed > FOOTER_Y - 24) {
    newPage(c);
  }
}

function wrappedText(
  c: Cursor,
  text: string,
  options: {
    size?: number;
    bold?: boolean;
    italic?: boolean;
    color?: [number, number, number];
    indent?: number;
    spacing?: number;
    lineHeight?: number;
  } = {},
) {
  const {
    size = 10,
    bold = false,
    italic = false,
    color = COLORS.slate700,
    indent = 0,
    spacing = 6,
    lineHeight = 1.45,
  } = options;
  c.doc.setFont(
    "helvetica",
    bold && italic ? "bolditalic" : bold ? "bold" : italic ? "italic" : "normal",
  );
  c.doc.setFontSize(size);
  setText(c, color);
  const lineWidth = PAGE_W - 2 * MARGIN_X - indent;
  const lines = c.doc.splitTextToSize(text || "—", lineWidth) as string[];
  const lineH = size * lineHeight;
  for (const line of lines) {
    ensureSpace(c, lineH);
    c.doc.text(line, MARGIN_X + indent, c.y);
    c.y += lineH;
  }
  c.y += spacing;
}

function sectionHeading(c: Cursor, text: string, color = COLORS.violet) {
  ensureSpace(c, 28);
  c.y += 4;
  setFill(c, color);
  c.doc.rect(MARGIN_X, c.y - 9, 4, 14, "F");
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(15);
  setText(c, COLORS.slate900);
  c.doc.text(text, MARGIN_X + 12, c.y + 2);
  c.y += 22;
}

function badge(
  c: Cursor,
  x: number,
  text: string,
  fg: [number, number, number],
  bg: [number, number, number],
) {
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(8);
  const tw = c.doc.getTextWidth(text);
  const padX = 6;
  const w = tw + padX * 2;
  const h = 14;
  setFill(c, bg);
  c.doc.roundedRect(x, c.y - 10, w, h, 3, 3, "F");
  setText(c, fg);
  c.doc.text(text, x + padX, c.y);
  return x + w + 6;
}

function severityColors(sev: string): {
  fg: [number, number, number];
  bg: [number, number, number];
} {
  if (sev === "critical") return { fg: COLORS.rose, bg: [254, 226, 226] };
  if (sev === "warning") return { fg: COLORS.amber, bg: [254, 243, 199] };
  return { fg: COLORS.sky, bg: [219, 234, 254] };
}

function scoreColor(score: number): [number, number, number] {
  if (score >= 85) return COLORS.emerald;
  if (score >= 65) return COLORS.amber;
  return COLORS.rose;
}

function scoreBox(c: Cursor, x: number, y: number, w: number, h: number, label: string, value: number) {
  setFill(c, COLORS.slate100);
  c.doc.roundedRect(x, y, w, h, 6, 6, "F");
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(22);
  setText(c, scoreColor(value));
  c.doc.text(String(value), x + w / 2, y + h / 2 + 2, { align: "center" });
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(8);
  setText(c, COLORS.slate500);
  c.doc.text(label.toUpperCase(), x + w / 2, y + h - 8, { align: "center" });
}

function codeBlock(c: Cursor, code: string, language: string) {
  const size = 9;
  const lineH = size * 1.4;
  const lines = code.split("\n");
  const padding = 10;
  const totalH = lines.length * lineH + padding * 2 + 18;
  ensureSpace(c, Math.max(40, Math.min(totalH, FOOTER_Y - c.y - 30)));

  setFill(c, COLORS.slate100);
  setStroke(c, COLORS.slate200);
  c.doc.setLineWidth(0.5);
  c.doc.roundedRect(MARGIN_X, c.y, PAGE_W - 2 * MARGIN_X, 18, 4, 4, "FD");
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(8);
  setText(c, COLORS.violet);
  c.doc.text(language.toUpperCase(), MARGIN_X + 8, c.y + 12);
  c.y += 18 + 6;

  c.doc.setFont("courier", "normal");
  c.doc.setFontSize(size);
  setText(c, COLORS.slate900);
  for (const raw of lines) {
    const wrapped = c.doc.splitTextToSize(
      raw || " ",
      PAGE_W - 2 * MARGIN_X - 8,
    ) as string[];
    for (const w of wrapped) {
      ensureSpace(c, lineH);
      c.doc.text(w, MARGIN_X + 4, c.y);
      c.y += lineH;
    }
  }
  c.y += 8;
}

function coverPage(c: Cursor, r: AnalysisResult) {
  setFill(c, [247, 244, 255]);
  c.doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // gradient-ish band
  setFill(c, COLORS.violet);
  c.doc.rect(0, 0, PAGE_W, 6, "F");

  c.y = 110;
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(12);
  setText(c, COLORS.violet);
  c.doc.text("CODIAN", MARGIN_X, c.y);
  c.doc.setFont("helvetica", "normal");
  c.doc.setFontSize(11);
  setText(c, COLORS.slate500);
  c.doc.text("AI Code Reviewer & Bug Explainer", MARGIN_X, c.y + 18);

  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(34);
  setText(c, COLORS.slate900);
  c.doc.text("Code Analysis Report", MARGIN_X, c.y + 80);

  // Score ring on the right column — drawn first so summary text never overlaps it
  const ringX = PAGE_W - MARGIN_X - 110;
  const summaryWidth = ringX - MARGIN_X - 20;

  c.doc.setFont("helvetica", "normal");
  c.doc.setFontSize(13);
  setText(c, COLORS.slate700);
  const summary = c.doc.splitTextToSize(r.summary, summaryWidth) as string[];
  let yy = c.y + 120;
  for (const line of summary.slice(0, 12)) {
    c.doc.text(line, MARGIN_X, yy);
    yy += 18;
  }
  const ringY = c.y + 200;
  setFill(c, COLORS.white);
  setStroke(c, scoreColor(r.scores.overall));
  c.doc.setLineWidth(6);
  c.doc.circle(ringX + 55, ringY + 55, 50, "FD");
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(36);
  setText(c, scoreColor(r.scores.overall));
  c.doc.text(String(r.scores.overall), ringX + 55, ringY + 65, { align: "center" });
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(8);
  setText(c, COLORS.slate500);
  c.doc.text("OVERALL SCORE", ringX + 55, ringY + 130, { align: "center" });

  // meta block
  setFill(c, COLORS.white);
  setStroke(c, COLORS.slate200);
  c.doc.setLineWidth(0.5);
  c.doc.roundedRect(MARGIN_X, PAGE_H - 200, PAGE_W - 2 * MARGIN_X, 110, 6, 6, "FD");

  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(9);
  setText(c, COLORS.slate500);
  c.doc.text("LANGUAGE", MARGIN_X + 16, PAGE_H - 175);
  c.doc.text("BUGS DETECTED", MARGIN_X + 180, PAGE_H - 175);
  c.doc.text("TIME COMPLEXITY", MARGIN_X + 320, PAGE_H - 175);

  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(16);
  setText(c, COLORS.slate900);
  c.doc.text(r.language, MARGIN_X + 16, PAGE_H - 152);
  c.doc.text(String(r.bugs.length), MARGIN_X + 180, PAGE_H - 152);
  c.doc.text(r.complexity.time, MARGIN_X + 320, PAGE_H - 152);

  c.doc.setFont("helvetica", "normal");
  c.doc.setFontSize(9);
  setText(c, COLORS.slate500);
  c.doc.text(
    `Generated ${new Date().toLocaleString()}`,
    MARGIN_X + 16,
    PAGE_H - 110,
  );

  newPage(c);
}

export function generatePdfReport(result: AnalysisResult): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const c: Cursor = { doc, y: MARGIN_X + 16, page: 1 };

  coverPage(c, result);

  // Summary
  sectionHeading(c, "Summary");
  wrappedText(c, result.summary, { size: 11, color: COLORS.slate700 });

  // Quality Scores
  sectionHeading(c, "Quality Scores", COLORS.fuchsia);
  ensureSpace(c, 90);
  const boxW = (PAGE_W - 2 * MARGIN_X - 24) / 4;
  const boxH = 70;
  const items = [
    { k: "readability", label: "Readable" },
    { k: "performance", label: "Fast" },
    { k: "security", label: "Secure" },
    { k: "maintainability", label: "Maintain" },
  ] as const;
  items.forEach((it, i) => {
    const x = MARGIN_X + i * (boxW + 8);
    scoreBox(c, x, c.y, boxW, boxH, it.label, result.scores[it.k]);
  });
  c.y += boxH + 16;

  // Complexity
  sectionHeading(c, "Complexity Analysis", COLORS.sky);
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(11);
  setText(c, COLORS.slate900);
  c.doc.text("Time:", MARGIN_X, c.y);
  c.doc.setFont("courier", "bold");
  setText(c, COLORS.sky);
  c.doc.text(result.complexity.time, MARGIN_X + 40, c.y);
  c.doc.setFont("helvetica", "bold");
  setText(c, COLORS.slate900);
  c.doc.text("Space:", MARGIN_X + 160, c.y);
  c.doc.setFont("courier", "bold");
  setText(c, COLORS.violet);
  c.doc.text(result.complexity.space, MARGIN_X + 205, c.y);
  c.y += 16;

  wrappedText(c, result.complexity.explanation, { size: 10, color: COLORS.slate700 });
  if (result.complexity.bottleneck) {
    wrappedText(c, `Bottleneck: ${result.complexity.bottleneck}`, {
      size: 10,
      bold: true,
      color: COLORS.amber,
    });
  }

  // Bugs
  sectionHeading(c, `Bugs (${result.bugs.length})`, COLORS.rose);
  if (result.bugs.length === 0) {
    wrappedText(c, "No bugs detected. Reviewer found this code clean.", {
      color: COLORS.emerald,
      bold: true,
    });
  }
  result.bugs.forEach((bug, idx) => {
    ensureSpace(c, 80);
    c.doc.setFont("helvetica", "bold");
    c.doc.setFontSize(12);
    setText(c, COLORS.slate900);
    c.doc.text(`${idx + 1}. ${bug.title}`, MARGIN_X, c.y);
    c.y += 16;

    let x = MARGIN_X;
    const sev = severityColors(bug.severity);
    x = badge(c, x, bug.severity.toUpperCase(), sev.fg, sev.bg);
    if (bug.line !== null) {
      x = badge(c, x, `LINE ${bug.line}`, COLORS.slate700, COLORS.slate100);
    }
    badge(c, x, bug.category.toUpperCase(), COLORS.slate700, COLORS.slate100);
    c.y += 12;

    wrappedText(c, bug.description, { size: 10, color: COLORS.slate700 });

    wrappedText(c, "Why this is a bug", {
      size: 9,
      bold: true,
      color: COLORS.violet,
      spacing: 2,
    });
    wrappedText(c, bug.why, { size: 10, color: COLORS.slate700 });

    wrappedText(c, "How to fix", {
      size: 9,
      bold: true,
      color: COLORS.emerald,
      spacing: 2,
    });
    wrappedText(c, bug.fix, { size: 10, color: COLORS.slate700, spacing: 14 });
  });

  // Optimized code
  sectionHeading(c, "Optimized Code", COLORS.emerald);
  if (result.optimizedCodeNotes) {
    wrappedText(c, result.optimizedCodeNotes, {
      size: 10,
      color: COLORS.slate700,
    });
  }
  codeBlock(c, result.optimizedCode, result.language);

  addFooter(c);
  return doc;
}

export function downloadPdfReport(result: AnalysisResult, filename?: string) {
  const doc = generatePdfReport(result);
  const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
  doc.save(filename ?? `codian-report-${ts}.pdf`);
}
