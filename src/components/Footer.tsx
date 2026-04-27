export function Footer() {
  return (
    <footer className="mt-12 border-t border-white/5 bg-black/20">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-white/45 sm:flex-row sm:px-6 lg:px-8">
        <div>
          Built with{" "}
          <span className="font-semibold text-white/70">Next.js 16</span> &middot;{" "}
          <span className="font-semibold text-white/70">Llama 3.3 70B</span> via Groq
        </div>
        <div>© {new Date().getFullYear()} CodeSage — University Project</div>
      </div>
    </footer>
  );
}
