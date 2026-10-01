import { VisitorStatsPanel } from "@/components/visitor-stats-panel";

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-7xl px-5 pb-8 pt-8">
      <div className="flex flex-wrap items-center justify-between gap-5 border-t border-line pt-6 text-xs text-muted">
        <div>
          <p className="font-mono tracking-widest">ROBOT KNOWLEDGE PLATFORM</p>
          <p className="mt-2">开源知识 · 共同进步 · 更智能的未来</p>
        </div>
        <VisitorStatsPanel />
        <p className="flex items-center gap-3 font-mono text-[10px] tracking-[0.2em]">
          <span className="h-px w-8 bg-accent" />
          BUILD INTELLIGENT TOGETHER
        </p>
      </div>
    </footer>
  );
}
