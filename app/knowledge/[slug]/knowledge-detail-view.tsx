"use client";

import type { MouseEvent } from "react";
import { useMemo, useState } from "react";

import { MarkdownContent } from "@/components/markdown-content";
import type { KnowledgeSection } from "@/lib/knowledge/sections";

type KnowledgeDetailViewProps = {
  editHref: string;
  sections: KnowledgeSection[];
};

type ContextMenuState = {
  x: number;
  y: number;
};

export function KnowledgeDetailView({
  editHref,
  sections,
}: KnowledgeDetailViewProps) {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const activeIndex = Math.min(activeSectionIndex, sections.length - 1);
  const activeSection = useMemo(
    () => sections[activeIndex],
    [activeIndex, sections],
  );

  function selectSection(index: number) {
    setActiveSectionIndex(index);
    setContextMenu(null);
    window.requestAnimationFrame(() => {
      document.getElementById("knowledge-section-content")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function openContextMenu(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
    });
  }

  if (!activeSection) {
    return (
      <div className="mx-auto w-[80vw] max-w-none px-5 py-6">
        <article className="rounded-lg border border-[#d8dee6] bg-white p-6 text-sm text-[#667085]">
          暂无章节内容
        </article>
      </div>
    );
  }

  return (
    <div
      className="mx-auto grid w-[80vw] max-w-none gap-5 px-5 py-6 lg:grid-cols-[260px_1fr]"
      onClick={() => setContextMenu(null)}
    >
      <aside className="h-fit rounded-lg border border-[#d8dee6] bg-white p-4 lg:sticky lg:top-24">
        <h2 className="text-sm font-semibold text-[#667085]">章节导航</h2>
        <nav className="mt-3 max-h-[calc(100vh-180px)] space-y-1 overflow-y-auto">
          {sections.map((section, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={`${section.id}-${index}`}
                type="button"
                aria-current={isActive ? "true" : undefined}
                onClick={() => selectSection(index)}
                onContextMenu={openContextMenu}
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

      <article
        id="knowledge-section-content"
        className="min-w-0 rounded-lg border border-[#d8dee6] bg-white p-6"
      >
        <h2 className="mb-5 border-b border-[#d8dee6] pb-4 text-2xl font-bold leading-tight text-[#171a20]">
          {activeSection.title}
        </h2>
        <div className="space-y-5 text-sm leading-7 text-[#3f4754]">
          <MarkdownContent source={activeSection.content} />
        </div>
      </article>

      {contextMenu && (
        <div
          className="fixed z-50 w-44 overflow-hidden rounded-md border border-[#cfd6df] bg-white py-1 text-sm shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <a
            href={editHref}
            className="block px-3 py-2 text-left text-[#3f4754] hover:bg-[#f0f3f6]"
          >
            编辑本章节
          </a>
          <a
            href={editHref}
            className="block px-3 py-2 text-left text-[#3f4754] hover:bg-[#f0f3f6]"
          >
            新建子章节
          </a>
          <a
            href={editHref}
            className="block px-3 py-2 text-left text-[#3f4754] hover:bg-[#f0f3f6]"
          >
            新建章节
          </a>
        </div>
      )}
    </div>
  );
}
