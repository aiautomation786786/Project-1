"use client";

import { Editor, type OnMount } from "@monaco-editor/react";
import { useRef } from "react";
import type * as monaco from "monaco-editor";

interface Props {
  value: string;
  onChange: (v: string) => void;
  language: string;
  readOnly?: boolean;
  height?: string;
}

const LANG_TO_MONACO: Record<string, string> = {
  auto: "plaintext",
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  cpp: "cpp",
  c: "c",
  csharp: "csharp",
  go: "go",
  rust: "rust",
  ruby: "ruby",
  php: "php",
  swift: "swift",
  kotlin: "kotlin",
  sql: "sql",
};

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  height = "440px",
}: Props) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoInstance.editor.defineTheme("codesage-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6b7280", fontStyle: "italic" },
        { token: "keyword", foreground: "c084fc" },
        { token: "string", foreground: "fbbf24" },
        { token: "number", foreground: "38bdf8" },
        { token: "type", foreground: "f472b6" },
        { token: "function", foreground: "60a5fa" },
      ],
      colors: {
        "editor.background": "#00000000",
        "editor.foreground": "#e5e7eb",
        "editorLineNumber.foreground": "#4b5563",
        "editorLineNumber.activeForeground": "#a78bfa",
        "editor.selectionBackground": "#8b5cf640",
        "editor.lineHighlightBackground": "#ffffff08",
        "editorCursor.foreground": "#a78bfa",
        "editorIndentGuide.background": "#ffffff10",
        "editorIndentGuide.activeBackground": "#ffffff25",
      },
    });
    monacoInstance.editor.setTheme("codesage-dark");
  };

  return (
    <div
      className="overflow-hidden rounded-xl border border-white/10 bg-black/40"
      style={{ height }}
    >
      <Editor
        value={value}
        onChange={(v) => onChange(v ?? "")}
        language={LANG_TO_MONACO[language] ?? "plaintext"}
        onMount={handleMount}
        theme="codesage-dark"
        options={{
          readOnly,
          fontSize: 13.5,
          fontFamily:
            'var(--font-geist-mono), "SF Mono", Menlo, Monaco, "Courier New", monospace',
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          renderLineHighlight: "line",
          lineNumbers: "on",
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 8,
          tabSize: 2,
          wordWrap: "on",
          wrappingIndent: "indent",
          automaticLayout: true,
          formatOnPaste: true,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />
    </div>
  );
}
