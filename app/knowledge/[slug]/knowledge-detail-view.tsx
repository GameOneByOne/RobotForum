"use client";

import { useMemo, useState } from "react";

import { MarkdownContent } from "@/components/markdown-content";
import type { KnowledgeSection } from "@/lib/knowledge/sections";

type KnowledgeDetailViewProps = {
  sections: KnowledgeSection[];
};

export function KnowledgeDetailView({ sections }: KnowledgeDetailViewProps) {
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id);
  const activeSection = useMemo(
    () =>
      sections.find((section) => section.id === activeSectionId) ??
      sections[0],
    [activeSectionId, sections],
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-lg border border-[#d8dee6] bg-white p-4 lg:sticky lg:top-24">
        <h2 className="text-sm font-semibold text-[#667085]">章节导航</h2>
        <nav className="mt-3 max-h-[calc(100vh-180px)] space-y-1 overflow-y-auto">
          {sections.map((section) => {
            const isActive = section.id === activeSection.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSectionId(section.id)}
                className={`block w-full truncate rounded-md px-3 py-2 text-left text-sm font-medium ${
                  isActive
                    ? "bg-[#24706f] text-white"
                    : "text-[#3f4754] hover:bg-[#f0f3f6] hover:text-[#24706f]"
                }`}
                style={{
                  paddingLeft: `${12 + Math.max(section.level - 1, 0) * 14}px`,
                }}
              >
                {section.title}
              </button>
            );
          })}
        </nav>
      </aside>

      <article className="min-w-0 rounded-lg border border-[#d8dee6] bg-white p-6">
        <div className="space-y-5 text-sm leading-7 text-[#3f4754]">
          <MarkdownContent source={activeSection.content} />
        </div>
      </article>
    </div>
  );
}
