# Codian — AI Code Reviewer & Bug Explainer

> **Find bugs. Understand them. Ship better code.**
> An AI-powered web app that reviews your code, explains *why* it's buggy,
> analyses time/space complexity, and rewrites it the optimized way.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![React](https://img.shields.io/badge/React-19-149eca) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)

---

## Features

- **Bug detection** — finds critical / warning / info-level issues with line numbers.
- **Why explanations** — every bug comes with an *educational* explanation, not just "this is wrong".
- **Big-O complexity analysis** — time + space complexity with the bottleneck called out.
- **Quality scoring** — 0–100 scores for readability, performance, security, maintainability, and overall.
- **Optimized version** — refactored, working code in the same language with notes on what changed.
- **15+ languages** — Python, JavaScript, TypeScript, Java, C, C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin, SQL, and more.
- **Light & dark themes** — fully themed UI with persistent toggle.
- **Professional PDF reports** — branded multi-page PDF with cover, scores, bugs, complexity, and the optimized code.

## How it works

Codian uses a large language model with a strict-JSON system prompt to produce structured analysis: detected language, bugs (severity, line, category, description, *why*, fix), complexity (time + space) with bottleneck, quality scores, and an optimized rewrite with change notes. The Next.js server normalizes and validates the response, then the React UI renders it as a tabbed analysis panel.

## Architecture

```
┌──────────────────────────┐         ┌──────────────────────────┐
│      Next.js Client      │◀───────▶│    Next.js API Route     │
│  (React 19 + Monaco UI)  │  JSON   │      /api/analyze        │
└──────────────────────────┘         └────────────┬─────────────┘
                                                  │
                                                  ▼
                                     ┌──────────────────────────┐
                                     │   AI Inference Backend   │
                                     └──────────────────────────┘
```

- **UI:** `src/app/page.tsx` + `src/components/*` (client components, Framer Motion animations)
- **Editor:** Monaco (`@monaco-editor/react`) with custom Codian light & dark themes
- **Backend:** `src/app/api/analyze/route.ts` — Node runtime, JSON-only response, safe error handling
- **Prompt:** `src/lib/prompt.ts` — strict JSON system prompt + user prompt builder
- **Types:** `src/lib/types.ts` — fully typed with TypeScript
- **PDF reports:** `src/lib/pdfReport.ts` — branded multi-page export via `jspdf`

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure your inference API key
cp .env.example .env.local
# then edit .env.local and paste your GROQ_API_KEY
# (free key at https://console.groq.com/keys)

# 3. Start the dev server
npm run dev
# open http://localhost:3000
```

### Production build

```bash
npm run build
npm start
```

### Environment variables

| Var             | Required | Description                                              |
| --------------- | -------- | -------------------------------------------------------- |
| `GROQ_API_KEY`  | yes      | Inference provider API key                               |
| `GROQ_MODEL`    | no       | Model id (default `llama-3.3-70b-versatile`)             |

## Tech stack

| Layer       | Choice                                                |
| ----------- | ----------------------------------------------------- |
| Framework   | Next.js 16 (App Router) + React 19                    |
| Language    | TypeScript                                            |
| Styling     | Tailwind CSS 4 + custom glassmorphism                 |
| Animations  | Framer Motion                                         |
| Editor      | Monaco (`@monaco-editor/react`)                       |
| Icons       | lucide-react                                          |
| PDF export  | jsPDF                                                 |
| Theme       | next-themes (light + dark with toggle)                |
| Deploy      | Vercel-style static + edge / any Node host            |

## Try it instantly

The home page comes preloaded with three buggy samples (Python fibonacci, JavaScript async race, C++ buffer overflow) so you can see the reviewer in action before pasting your own code.

## Project structure

```
codian/
├─ src/
│  ├─ app/
│  │  ├─ api/analyze/route.ts   ← AI-powered analysis endpoint
│  │  ├─ globals.css            ← Tailwind + theme tokens
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ components/               ← UI components (Hero, Editor, AnalysisPanel, …)
│  └─ lib/
│     ├─ prompt.ts              ← LLM system + user prompts
│     ├─ pdfReport.ts           ← Branded PDF export
│     ├─ types.ts
│     └─ utils.ts
├─ public/
└─ package.json
```

## License

© Codian. All rights reserved.
