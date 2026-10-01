import Link from "next/link";
import { iconForContent, TechIcon } from "@/components/tech-icon";

type ContentCardProps = {
  title: string;
  description: string;
  href?: string;
  meta?: string;
  tags?: string[];
  index?: number;
};

export function ContentCard({
  title,
  description,
  href,
  meta,
  tags = [],
  index,
}: ContentCardProps) {
  const inner = (
    <>
      <div className="mb-7 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        <span>{meta || (tags[0] ?? "KNOWLEDGE")}</span>
        {index !== undefined && (
          <span>{String(index + 1).padStart(2, "0")}</span>
        )}
      </div>
      <div className="mb-6 text-[#9aafc3]">
        <TechIcon kind={iconForContent(title, tags)} />
      </div>
      <h3 className="card-title text-xl font-semibold leading-snug text-ink lg:text-2xl">
        {title}
      </h3>
      <span className="my-5 h-px w-7 bg-accent/70" />
      <p className="mb-7 line-clamp-3 text-sm leading-7 text-secondary">
        {description}
      </p>
      <div className="mt-auto flex items-end justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="tech-tag">
              {tag}
            </span>
          ))}
        </div>
        {href && (
          <span aria-hidden="true" className="shrink-0 text-xl text-muted">
            →
          </span>
        )}
      </div>
    </>
  );
  return href ? (
    <Link href={href} className="tech-card group">
      {inner}
    </Link>
  ) : (
    <article className="tech-card">{inner}</article>
  );
}
