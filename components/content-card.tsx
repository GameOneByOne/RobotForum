import Link from "next/link";

import { getTagColorClass } from "@/lib/tag-colors";

type ContentCardProps = {
  title: string;
  description: string;
  href?: string;
  meta?: string;
  tags?: string[];
};

export function ContentCard({
  title,
  description,
  href,
  meta,
  tags = [],
}: ContentCardProps) {
  const inner = (
    <>
      {meta && (
        <p className="text-xs font-semibold uppercase text-[#24706f]">{meta}</p>
      )}
      <h3 className="mt-2 text-lg font-semibold leading-snug">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#5b6472]">{description}</p>
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={tag}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${getTagColorClass(index)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-lg border border-[#d8dee6] bg-white p-5 transition hover:border-[#24706f] hover:shadow-sm"
      >
        {inner}
      </Link>
    );
  }

  return (
    <article className="rounded-lg border border-[#d8dee6] bg-white p-5">
      {inner}
    </article>
  );
}
