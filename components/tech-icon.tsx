export type TechIconKind = "robot" | "terminal" | "nodes" | "book";

export function TechIcon({
  kind = "robot",
  className = "h-20 w-20",
}: {
  kind?: TechIconKind;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
      className={className}
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {kind === "robot" ? (
        <>
          <path d="M13 68h43v5H13zM22 68V55l-8-15 28-27 19 14-8 20M29 63l6-16 16-14M61 27l10 19-4 10M71 46l-8 4 1 10" />
          <circle cx="21" cy="39" r="7" />
          <circle cx="44" cy="17" r="7" />
          <circle cx="60" cy="29" r="5" />
          <circle cx="21" cy="39" r="3" className="text-accent" />
          <circle cx="44" cy="17" r="3" className="text-accent" />
        </>
      ) : kind === "terminal" ? (
        <>
          <rect x="9" y="13" width="62" height="53" rx="5" />
          <path d="M9 27h62" />
          <circle cx="17" cy="20" r="1" />
          <circle cx="23" cy="20" r="1" />
          <circle cx="29" cy="20" r="1" />
          <path d="m23 38 9 8-9 8M40 54h17" className="text-accent" />
        </>
      ) : kind === "nodes" ? (
        <>
          <path d="m40 9 13 8v15l-13 8-13-8V17zM27 17l13 8 13-8M40 25v15M15 48l12 7v14l-12 7-12-7V55zM65 48l12 7v14l-12 7-12-7V55zM40 40v7M40 47 15 48M40 47l25 1M27 62h26" />
          <circle cx="40" cy="47" r="3" className="text-accent" />
        </>
      ) : (
        <>
          <path d="M40 23C29 13 15 17 9 21v43c11-6 22-5 31 2 9-7 20-8 31-2V21c-6-4-20-8-31 2zM40 23v43M17 30h13M17 38h13M50 30h13M50 38h13" />
          <path d="M17 48h10M50 48h10" className="text-accent" />
        </>
      )}
    </svg>
  );
}

export function iconForContent(title: string, tags: string[]): TechIconKind {
  const text = [title, ...tags].join(" ").toLowerCase();
  if (/linux|git|conda|命令|软件|编程/.test(text)) return "terminal";
  if (/ros|框架|网络|通信/.test(text)) return "nodes";
  if (/机器|运动|硬件|机械/.test(text)) return "robot";
  return "book";
}
