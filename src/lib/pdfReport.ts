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
  const lineH = size * 1.45;
  const innerPadX = 14;
  const innerPadY = 14;

  // Pre-wrap all lines with the courier font so width is accurate
  c.doc.setFont("courier", "normal");
  c.doc.setFontSize(size);
  const allWrapped: string[] = [];
  for (const raw of code.split("\n")) {
    const wrapped = c.doc.splitTextToSize(
      raw.length === 0 ? " " : raw,
      PAGE_W - 2 * MARGIN_X - innerPadX * 2,
    ) as string[];
    allWrapped.push(...(wrapped.length ? wrapped : [" "]));
  }

  // Header strip — dark, terminal-style with traffic-light dots
  const headerH = 24;
  // Reserve enough room for the header AND at least 2 lines of code, so the header
  // never gets orphaned at the bottom of a page just before a forced page break.
  ensureSpace(c, headerH + lineH * 2 + innerPadY * 2);
  setFill(c, [30, 41, 59]); // slate-800
  c.doc.roundedRect(MARGIN_X, c.y, PAGE_W - 2 * MARGIN_X, headerH, 6, 6, "F");
  // Square off the bottom of the header so it joins seamlessly with the code body below
  setFill(c, [30, 41, 59]);
  c.doc.rect(MARGIN_X, c.y + headerH - 6, PAGE_W - 2 * MARGIN_X, 6, "F");

  // Traffic-light dots
  const dotsY = c.y + headerH / 2;
  setFill(c, [248, 113, 113]);
  c.doc.circle(MARGIN_X + 14, dotsY, 3.2, "F");
  setFill(c, [251, 191, 36]);
  c.doc.circle(MARGIN_X + 26, dotsY, 3.2, "F");
  setFill(c, [74, 222, 128]);
  c.doc.circle(MARGIN_X + 38, dotsY, 3.2, "F");

  // Language label
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(8);
  setText(c, [203, 213, 225]); // slate-300
  c.doc.text(
    language.toUpperCase(),
    PAGE_W - MARGIN_X - 12,
    dotsY + 3,
    { align: "right" },
  );

  c.y += headerH;

  // Render lines, painting a slate100 background slab per page so the code reads as a proper block
  let i = 0;
  while (i < allWrapped.length) {
    const segStart = c.y;
    const available = FOOTER_Y - 24 - segStart;
    if (available < lineH * 2 + innerPadY * 2) {
      newPage(c);
      continue;
    }
    const linesThisPage = Math.min(
      allWrapped.length - i,
      Math.floor((available - innerPadY * 2) / lineH),
    );
    const segH = linesThisPage * lineH + innerPadY * 2;

    // Background slab
    setFill(c, [248, 250, 252]); // slate-50
    setStroke(c, COLORS.slate200);
    c.doc.setLineWidth(0.5);
    c.doc.rect(MARGIN_X, segStart, PAGE_W - 2 * MARGIN_X, segH, "F");
    // Left accent rail
    setFill(c, COLORS.violet);
    c.doc.rect(MARGIN_X, segStart, 3, segH, "F");

    c.doc.setFont("courier", "normal");
    c.doc.setFontSize(size);
    setText(c, [15, 23, 42]); // slate-900

    let lineY = segStart + innerPadY + lineH - 2;
    for (let k = 0; k < linesThisPage; k++) {
      c.doc.text(allWrapped[i + k], MARGIN_X + innerPadX, lineY);
      lineY += lineH;
    }
    i += linesThisPage;
    c.y = segStart + segH;

    if (i < allWrapped.length) {
      newPage(c);
    }
  }
  c.y += 14;
}

function gradeLetter(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function coverPage(c: Cursor, r: AnalysisResult) {
  // Soft lavender canvas
  setFill(c, [247, 244, 255]);
  c.doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // Top brand band — violet over fuchsia for a faux-gradient
  setFill(c, COLORS.violet);
  c.doc.rect(0, 0, PAGE_W, 8, "F");
  setFill(c, COLORS.fuchsia);
  c.doc.rect(0, 8, PAGE_W, 2, "F");

  // Branded header bar
  const headerY = 56;
  // Logo mark
  setFill(c, COLORS.violet);
  c.doc.roundedRect(MARGIN_X, headerY - 14, 26, 26, 7, 7, "F");
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(15);
  setText(c, COLORS.white);
  c.doc.text("C", MARGIN_X + 13, headerY + 4, { align: "center" });

  // Wordmark
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(17);
  setText(c, COLORS.slate900);
  c.doc.text("Codian", MARGIN_X + 38, headerY + 4);

  // Tagline
  c.doc.setFont("helvetica", "normal");
  c.doc.setFontSize(10);
  setText(c, COLORS.slate500);
  c.doc.text(
    "AI Code Reviewer & Bug Explainer",
    MARGIN_X + 100,
    headerY + 4,
  );

  // Hairline separator
  setStroke(c, COLORS.slate200);
  c.doc.setLineWidth(0.5);
  c.doc.line(MARGIN_X, headerY + 22, PAGE_W - MARGIN_X, headerY + 22);

  // Title
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(36);
  setText(c, COLORS.slate900);
  c.doc.text("Code Analysis Report", MARGIN_X, 160);

  // Subtitle pill — date · language · issues
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const issueWord = r.bugs.length === 1 ? "issue" : "issues";
  const subtitle = `${dateStr}    ·    ${r.language}    ·    ${r.bugs.length} ${issueWord} found`;
  c.doc.setFont("helvetica", "normal");
  c.doc.setFontSize(11);
  setText(c, COLORS.slate500);
  c.doc.text(subtitle, MARGIN_X, 184);

  // Centered score ring with grade letter
  const cx = PAGE_W / 2;
  const ringCY = 320;
  const ringR = 64;
  setFill(c, COLORS.white);
  setStroke(c, scoreColor(r.scores.overall));
  c.doc.setLineWidth(8);
  c.doc.circle(cx, ringCY, ringR, "FD");

  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(54);
  setText(c, scoreColor(r.scores.overall));
  c.doc.text(String(r.scores.overall), cx, ringCY + 10, { align: "center" });

  c.doc.setFont("helvetica", "normal");
  c.doc.setFontSize(10);
  setText(c, COLORS.slate500);
  c.doc.text("/ 100", cx, ringCY + 30, { align: "center" });

  // Grade
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(9);
  setText(c, COLORS.slate500);
  c.doc.text("OVERALL GRADE", cx, ringCY + 100, { align: "center" });
  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(28);
  setText(c, scoreColor(r.scores.overall));
  c.doc.text(gradeLetter(r.scores.overall), cx, ringCY + 128, {
    align: "center",
  });

  // Executive summary card
  const summaryY = 470;
  const summaryW = PAGE_W - 2 * MARGIN_X;
  c.doc.setFont("helvetica", "normal");
  c.doc.setFontSize(11);
  const summaryLines = c.doc.splitTextToSize(
    r.summary,
    summaryW - 32,
  ) as string[];
  const visibleLines = summaryLines.slice(0, 6);
  const cardH = visibleLines.length * 15 + 50;

  setFill(c, COLORS.white);
  setStroke(c, COLORS.slate200);
  c.doc.setLineWidth(0.5);
  c.doc.roundedRect(MARGIN_X, summaryY, summaryW, cardH, 8, 8, "FD");
  // Left accent bar
  setFill(c, COLORS.violet);
  c.doc.rect(MARGIN_X, summaryY, 3, cardH, "F");

  c.doc.setFont("helvetica", "bold");
  c.doc.setFontSize(8);
  setText(c, COLORS.violet);
  c.doc.text("EXECUTIVE SUMMARY", MARGIN_X + 16, summaryY + 20);

  c.doc.setFont("helvetica", "normal");
  c.doc.setFontSize(11);
  setText(c, COLORS.slate700);
  let yy = summaryY + 40;
  for (const line of visibleLines) {
    c.doc.text(line, MARGIN_X + 16, yy);
    yy += 15;
  }

  // Meta block at bottom — 4 columns
  const metaY = PAGE_H - 130;
  const metaH = 70;
  setFill(c, COLORS.white);
  setStroke(c, COLORS.slate200);
  c.doc.setLineWidth(0.5);
  c.doc.roundedRect(MARGIN_X, metaY, PAGE_W - 2 * MARGIN_X, metaH, 8, 8, "FD");

  const metaCols = [
    { label: "LANGUAGE", value: r.language },
    { label: "BUGS DETECTED", value: String(r.bugs.length) },
    { label: "TIME COMPLEXITY", value: r.complexity.time },
    { label: "SPACE COMPLEXITY", value: r.complexity.space },
  ];
  const colW = (PAGE_W - 2 * MARGIN_X) / metaCols.length;
  metaCols.forEach((m, i) => {
    const xCenter = MARGIN_X + i * colW + colW / 2;
    c.doc.setFont("helvetica", "bold");
    c.doc.setFontSize(8);
    setText(c, COLORS.slate500);
    c.doc.text(m.label, xCenter, metaY + 22, { align: "center" });
    c.doc.setFont("helvetica", "bold");
    c.doc.setFontSize(15);
    setText(c, COLORS.slate900);
    c.doc.text(m.value, xCenter, metaY + 48, { align: "center" });
    if (i < metaCols.length - 1) {
      setStroke(c, COLORS.slate200);
      c.doc.setLineWidth(0.5);
      c.doc.line(
        MARGIN_X + (i + 1) * colW,
        metaY + 12,
        MARGIN_X + (i + 1) * colW,
        metaY + metaH - 12,
      );
    }
  });

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
