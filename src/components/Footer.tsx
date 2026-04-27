export function Footer() {
  return (
    <footer className="mt-12 border-t border-violet-200/50 bg-white/40 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <div>
          Built with{" "}
          <span className="font-semibold text-slate-700">Next.js 16</span> &middot;{" "}
          <span className="font-semibold text-slate-700">Llama 3.3 70B</span> via Groq
        </div>
        <div>© {new Date().getFullYear()} CodeSage — University Project</div>
      </div>
    </footer>
  );
}
