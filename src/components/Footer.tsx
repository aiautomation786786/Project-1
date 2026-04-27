export function Footer() {
  return (
    <footer className="mt-12 border-t border-violet-200/50 bg-white/40 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Codian</span>
          <span className="text-slate-400">·</span>
          <span>AI Code Reviewer & Bug Explainer</span>
        </div>
        <div>© {new Date().getFullYear()} Codian. All rights reserved.</div>
      </div>
    </footer>
  );
}
