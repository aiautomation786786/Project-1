# CodeSage — AI Code Reviewer & Bug Explainer

> **Find bugs. Understand them. Ship better code.**
> A generative-AI web app that reviews your code, explains *why* it's buggy,
> analyses time/space complexity, and rewrites it the optimized way — built
> for students learning to code.

![Built with Next.js 16](https://img.shields.io/badge/Next.js-16-black) ![React 19](https://img.shields.io/badge/React-19-149eca) ![Tailwind 4](https://img.shields.io/badge/Tailwind-4-38bdf8) ![Llama 3.3 70B](https://img.shields.io/badge/Llama_3.3-70B-8b5cf6)

---

## ✨ Features

- **Bug detection** — finds critical / warning / info-level issues with line numbers.
- **Why explanations** — every bug comes with an *educational* explanation, not just "this is wrong".
- **Big-O complexity analysis** — time + space complexity with the bottleneck called out.
- **Quality scoring** — 0–100 scores for readability, performance, security, maintainability and an overall grade.
- **Optimized version** — refactored, working code in the same language with notes on what changed.
- **15+ languages** — Python, JavaScript, TypeScript, Java, C, C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin, SQL, and more.
- **Beautiful UI** — Monaco editor, animated gradients, glassmorphism, smooth Framer-Motion transitions.
- **Downloadable Markdown report** — handy for assignments and code-review records.

## 🧠 How the AI works

CodeSage sends your code to **Llama 3.3 70B** running on **Groq**'s ultra-low-latency LPU infrastructure. A carefully engineered system prompt forces the model to respond with strict JSON describing:

- detected language
- a list of bugs (severity, line, category, description, *why*, fix)
- complexity (time + space) with explanation and bottleneck
- quality scores
- an optimized rewrite of the code with change notes

The server normalizes and validates the response, then the React UI renders it as a tabbed analysis panel.

## 🏗️ Architecture

```
┌──────────────────────────┐         ┌──────────────────────────┐
│      Next.js Client      │◀──────▶│    Next.js API Route     │
│  (React 19 + Monaco UI)  │  JSON   │   /api/analyze (Node)    │
└──────────────────────────┘         └────────────┬─────────────┘
                                                  │ groq-sdk
                                                  ▼
                                     ┌──────────────────────────┐
                                     │   Groq · Llama 3.3 70B   │
                                     └──────────────────────────┘
```

- **UI:** `src/app/page.tsx` + `src/components/*` (client components, Framer Motion animations)
- **Editor:** Monaco (`@monaco-editor/react`) with custom CodeSage dark theme
- **Backend:** `src/app/api/analyze/route.ts` — Node runtime, JSON-only response, safe error handling
- **LLM:** `src/lib/prompt.ts` — strict JSON system prompt + user prompt builder
- **Types:** `src/lib/types.ts` — fully typed with TypeScript

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure your Groq key
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
| `GROQ_API_KEY`  | yes      | Your Groq API key                                        |
| `GROQ_MODEL`    | no       | Model id (default `llama-3.3-70b-versatile`)             |

## 📦 Tech stack

| Layer       | Choice                                                |
| ----------- | ----------------------------------------------------- |
| Framework   | Next.js 16 (App Router) + React 19                    |
| Language    | TypeScript                                            |
| Styling     | Tailwind CSS 4 + custom glassmorphism                 |
| Animations  | Framer Motion                                         |
| Editor      | Monaco (`@monaco-editor/react`)                       |
| Icons       | lucide-react                                          |
| LLM SDK     | `groq-sdk` (OpenAI-compatible)                        |
| Deploy      | Vercel-style static + edge / any Node host            |

## 🧪 Try it instantly

The home page comes preloaded with three buggy samples (Python fibonacci, JS async race, C++ buffer overflow) so you can see the reviewer in action before pasting your own code.

## 📁 Project structure

```
codesage/
├─ src/
│  ├─ app/
│  │  ├─ api/analyze/route.ts   ← Groq-powered analysis endpoint
│  │  ├─ globals.css            ← Tailwind + custom theme
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ components/               ← UI components (Hero, Editor, AnalysisPanel, …)
│  └─ lib/
│     ├─ prompt.ts              ← LLM system + user prompts
│     ├─ types.ts               ← shared interfaces
│     └─ utils.ts
├─ .env.example
├─ next.config.ts
└─ package.json
```

## 🗺️ Roadmap / limitations

- Larger code → chunked analysis (currently capped at 20,000 chars).
- Multi-file project review.
- Inline highlighting on the original editor (currently shows line numbers in bug cards).
- User accounts + history.
- Streaming responses for faster feedback.

## 📄 License

MIT — built for educational / university-project use.
