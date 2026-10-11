"use client";

import type { CSSProperties, MouseEvent } from "react";
import { useMemo, useState, useSyncExternalStore } from "react";

import { MarkdownContent } from "@/components/markdown-content";
import { readingOutline } from "@/lib/markdown/outline";
import type { KnowledgeSection } from "@/lib/knowledge/sections";

type KnowledgeDetailViewProps = {
  editHref: string;
  sections: KnowledgeSection[];
};

function subscribeWideScreen(callback: () => void) {
  const query = window.matchMedia("(min-width: 1024px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function readWideScreen() {
  return window.matchMedia("(min-width: 1024px)").matches;
}

const defaultSettings = '{"fontSize":17,"theme":"dark"}';
let sessionSettings = defaultSettings;
function subscribeSettings(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("reading-settings", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("reading-settings", callback);
  };
}
function readSettings() {
  try {
    return localStorage.getItem("robot-forum-reading") || sessionSettings;
  } catch {
    return sessionSettings;
  }
}
function writeSettings(value: string) {
  sessionSettings = value;
  try {
    localStorage.setItem("robot-forum-reading", value);
  } catch {
    /* Session fallback remains available. */
  }
  window.dispatchEvent(new Event("reading-settings"));
}
function parseSettings(value: string): {
  fontSize: number;
  theme: "light" | "dark";
} {
  try {
    const settings = JSON.parse(value);
    return {
      fontSize: [15, 17, 19].includes(settings.fontSize)
        ? settings.fontSize
        : 17,
      theme: settings.theme === "light" ? "light" : "dark",
    };
  } catch {
    return { fontSize: 17, theme: "dark" };
  }
}

type ContextMenuState = {
  x: number;
  y: number;
};

export function KnowledgeDetailView({
  editHref,
  sections,
}: KnowledgeDetailViewProps) {
  const wideScreen = useSyncExternalStore(
    subscribeWideScreen,
    readWideScreen,
    () => false,
  );
  const settingsValue = useSyncExternalStore(
    subscribeSettings,
    readSettings,
    () => defaultSettings,
  );
  const settings = parseSettings(settingsValue);
  function changeSettings(next: Partial<typeof settings>) {
    writeSettings(JSON.stringify({ ...settings, ...next }));
  }
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
      <div className="mx-auto w-full max-w-7xl px-5 py-6">
        <article className="rounded-xl border border-line bg-panel p-6 text-sm text-muted">
          暂无章节内容
        </article>
      </div>
    );
  }

  return (
    <div
      className="knowledge-reader mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[240px_minmax(0,1fr)]"
      data-theme={settings.theme}
      style={
        { "--reading-font-size": `${settings.fontSize}px` } as CSSProperties
      }
      onClick={() => setContextMenu(null)}
    >
      <aside className="h-fit rounded-xl border border-line bg-panel p-4 lg:sticky lg:top-24">
        <details open={wideScreen}>
          <summary className="text-sm font-semibold text-muted">
            章节导航
          </summary>
          <nav className="mt-3 max-h-[calc(100vh-180px)] space-y-1 overflow-y-auto">
            {sections.map((section, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={`${section.id}-${index}`}
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => selectSection(index)}
                  onContextMenu={openContextMenu}
                  className={`block w-full rounded-md px-3 py-2 text-left text-sm font-medium ${
                    isActive
                      ? "bg-accent-dim text-accent"
                      : "text-secondary hover:bg-raised hover:text-accent"
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
        </details>
      </aside>

      <article
        id="knowledge-section-content"
        className="reading-article min-w-0 rounded-xl border border-line bg-panel"
      >
        <div className="reading-column">
          <div className="reading-toolbar" aria-label="阅读设置">
            <span className="reading-toolbar-title">
              章节 {activeIndex + 1} / {sections.length}
            </span>
            <div className="reading-size-controls" aria-label="正文字号">
              {[
                { size: 15, label: "小" },
                { size: 17, label: "标准" },
                { size: 19, label: "大" },
              ].map((item) => (
                <button
                  key={item.size}
                  type="button"
                  aria-label={`${item.label}字号`}
                  aria-pressed={settings.fontSize === item.size}
                  onClick={() => changeSettings({ fontSize: item.size })}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-pressed={settings.theme === "light"}
              onClick={() =>
                changeSettings({
                  theme: settings.theme === "dark" ? "light" : "dark",
                })
              }
            >
              {settings.theme === "dark" ? "浅色阅读" : "深色阅读"}
            </button>
          </div>
          <h2 className="mb-5 border-b border-line pb-4 text-2xl font-bold leading-tight text-ink">
            {activeSection.title}
          </h2>
          {readingOutline(activeSection.content).length > 1 && (
            <details className="reading-outline">
              <summary>
                本节目录 · {readingOutline(activeSection.content).length} 个标题
              </summary>
              <nav aria-label="本节目录">
                {readingOutline(activeSection.content).map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    style={{ paddingLeft: Math.max(0, heading.level - 2) * 12 }}
                  >
                    {heading.title}
                  </a>
                ))}
              </nav>
            </details>
          )}
          <MarkdownContent
            key={activeSection.id}
            source={activeSection.content}
          />
          <nav className="reading-pagination" aria-label="章节翻页">
            {activeIndex > 0 ? (
              <button
                type="button"
                onClick={() => selectSection(activeIndex - 1)}
              >
                <span>← 上一章</span>
                {sections[activeIndex - 1].title}
              </button>
            ) : (
              <span />
            )}
            {activeIndex < sections.length - 1 && (
              <button
                type="button"
                onClick={() => selectSection(activeIndex + 1)}
              >
                <span>下一章 →</span>
                {sections[activeIndex + 1].title}
              </button>
            )}
          </nav>
        </div>
      </article>

      {contextMenu && (
        <div
          className="fixed z-50 w-44 overflow-hidden rounded-md border border-line bg-panel py-1 text-sm shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <a
            href={editHref}
            className="block px-3 py-2 text-left text-secondary hover:bg-raised"
          >
            编辑本章节
          </a>
          <a
            href={editHref}
            className="block px-3 py-2 text-left text-secondary hover:bg-raised"
          >
            新建子章节
          </a>
          <a
            href={editHref}
            className="block px-3 py-2 text-left text-secondary hover:bg-raised"
          >
            新建章节
          </a>
        </div>
      )}
    </div>
  );
}
