export function SearchForm({
  query = "",
  compact = false,
  action = "/search",
}: {
  query?: string;
  compact?: boolean;
  action?: string;
}) {
  return (
    <form
      role="search"
      action={action}
      method="get"
      className={`flex min-w-0 items-center gap-2 rounded-xl border border-line bg-panel transition-colors focus-within:border-accent ${compact ? "w-full px-3 py-1 lg:w-64 xl:w-72" : "w-full max-w-2xl px-4 py-2"}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-5 w-5 shrink-0 text-muted"
      >
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 5 5" />
      </svg>
      <input
        type="search"
        name="q"
        aria-label="搜索知识、项目、讨论和资源"
        placeholder="搜索知识、项目或问题…"
        defaultValue={query}
        maxLength={120}
        className="min-w-0 flex-1 bg-transparent py-2 text-sm text-ink outline-none focus-visible:outline-none"
      />
      <button
        type="submit"
        aria-label="提交搜索"
        className={`shrink-0 rounded-md px-2 py-2 text-sm text-accent hover:bg-accent-dim ${compact ? "" : "px-4"}`}
      >
        {compact ? "↵" : "搜索"}
      </button>
    </form>
  );
}
