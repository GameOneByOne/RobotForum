"use client";

import { useI18n } from "@/components/language-provider";

import type { CSSProperties, MouseEvent } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

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
  const { t } = useI18n();
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
  const [immersive, setImmersive] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);
  const immersiveButtonRef = useRef<HTMLButtonElement>(null);
  const immersiveRef = useRef(false);
  const nativeFullscreenRef = useRef(false);
  const savedScrollRef = useRef({ x: 0, y: 0 });
  const chaptersId = useId();
  const closeImmersive = useCallback(() => {
    immersiveRef.current = false;
    setImmersive(false);
    setShowChapters(false);
    if (document.fullscreenElement === readerRef.current) {
      void document.exitFullscreen().catch(() => {});
    }
  }, [setImmersive, setShowChapters]);

  useEffect(() => {
    const reader = readerRef.current;
    function onFullscreenChange() {
      if (document.fullscreenElement === reader) {
        nativeFullscreenRef.current = true;
      } else if (nativeFullscreenRef.current) {
        nativeFullscreenRef.current = false;
        closeImmersive();
      }
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      immersiveRef.current = false;
      if (reader && document.fullscreenElement === reader) {
        void document.exitFullscreen().catch(() => {});
      }
    };
  }, [closeImmersive]);

  useEffect(() => {
    const reader = readerRef.current;
    if (!immersive || !reader) return;
    const previousOverflow = document.body.style.overflow;
    const immersiveButton = immersiveButtonRef.current;
    document.body.style.overflow = "hidden";
    // Make the viewport fallback behave like a modal even without native
    // fullscreen: background navigation cannot receive keyboard focus.
    const inertElements = new Map<HTMLElement, boolean>();
    let current: HTMLElement = reader;
    while (current.parentElement && current !== document.body) {
      for (const sibling of current.parentElement.children) {
        if (sibling !== current && sibling instanceof HTMLElement) {
          inertElements.set(sibling, sibling.inert);
          sibling.setAttribute("inert", "");
        }
      }
      current = current.parentElement;
    }
    immersiveButton?.focus({ preventScroll: true });
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || document.querySelector("dialog[open]"))
        return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeImmersive();
      } else if (event.key === "Tab") {
        const controls = Array.from(
          reader!.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex="0"]',
          ),
        ).filter(
          (element) => element.getClientRects().length && element.tabIndex >= 0,
        );
        const first = controls[0];
        const last = controls.at(-1);
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === reader)
        ) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      inertElements.forEach((wasInert, element) => {
        if (wasInert) element.setAttribute("inert", "");
        else element.removeAttribute("inert");
      });
      const position = savedScrollRef.current;
      window.requestAnimationFrame(() => {
        if (!reader.isConnected) return;
        window.scrollTo({
          left: position.x,
          top: position.y,
          behavior: "instant",
        });
        immersiveButton?.focus({ preventScroll: true });
      });
    };
  }, [immersive, closeImmersive]);

  function toggleImmersive() {
    if (immersiveRef.current) {
      closeImmersive();
      return;
    }
    const reader = readerRef.current;
    if (!reader) return;
    savedScrollRef.current = { x: window.scrollX, y: window.scrollY };
    immersiveRef.current = true;
    setImmersive(true);
    setContextMenu(null);
    // The fixed viewport layout remains active when fullscreen is unavailable
    // or rejected (for example on mobile browsers or inside an iframe).
    if (reader.requestFullscreen) {
      void reader
        .requestFullscreen()
        .then(() => {
          if (!immersiveRef.current && document.fullscreenElement === reader) {
            void document.exitFullscreen().catch(() => {});
          }
        })
        .catch(() => {});
    }
  }
  const activeIndex = Math.min(activeSectionIndex, sections.length - 1);
  const activeSection = useMemo(
    () => sections[activeIndex],
    [activeIndex, sections],
  );

  function selectSection(index: number) {
    setActiveSectionIndex(index);
    setContextMenu(null);
    setShowChapters(false);
    window.requestAnimationFrame(() => {
      if (immersiveRef.current) {
        readerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
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
          {t("暂无章节内容")}
        </article>
      </div>
    );
  }

  return (
    <div
      ref={readerRef}
      className={`knowledge-reader mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[240px_minmax(0,1fr)]${immersive ? " reading-immersive" : ""}`}
      role={immersive ? "dialog" : undefined}
      aria-modal={immersive ? true : undefined}
      aria-label={immersive ? t("沉浸式阅读") : undefined}
      data-chapters={showChapters ? "open" : "closed"}
      data-theme={settings.theme}
      style={
        { "--reading-font-size": `${settings.fontSize}px` } as CSSProperties
      }
      onClick={() => setContextMenu(null)}
    >
      <aside
        id={chaptersId}
        className="reading-chapters h-fit rounded-xl border border-line bg-panel p-4 lg:sticky lg:top-24"
      >
        <details open={immersive || wideScreen}>
          <summary className="text-sm font-semibold text-muted">
            {t("章节导航")}
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
          <div className="reading-toolbar" aria-label={t("阅读设置")}>
            <span className="reading-toolbar-title">
              {t("章节")} {activeIndex + 1} / {sections.length}
            </span>
            <div className="reading-size-controls" aria-label={t("正文字号")}>
              {[
                { size: 15, label: t("小") },
                { size: 17, label: t("标准") },
                { size: 19, label: t("大") },
              ].map((item) => (
                <button
                  key={item.size}
                  type="button"
                  aria-label={t("{0}字号", { "0": item.label })}
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
              {settings.theme === "dark" ? t("浅色阅读") : t("深色阅读")}
            </button>
            {immersive && (
              <button
                type="button"
                aria-expanded={showChapters}
                aria-controls={chaptersId}
                onClick={() => setShowChapters((value) => !value)}
              >
                {t("章节导航")}
              </button>
            )}
            <button
              ref={immersiveButtonRef}
              type="button"
              aria-pressed={immersive}
              onClick={toggleImmersive}
            >
              {immersive ? t("退出沉浸式") : t("沉浸式阅读")}
            </button>
            {immersive && (
              <span className="reading-exit-hint">{t("Esc 退出")}</span>
            )}
          </div>
          <h2 className="mb-5 border-b border-line pb-4 text-2xl font-bold leading-tight text-ink">
            {activeSection.title}
          </h2>
          {readingOutline(activeSection.content).length > 1 && (
            <details className="reading-outline">
              <summary>
                {t("本节目录 · {0} 个标题", {
                  "0": readingOutline(activeSection.content).length,
                })}
              </summary>
              <nav aria-label={t("本节目录")}>
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
          <nav className="reading-pagination" aria-label={t("章节翻页")}>
            {activeIndex > 0 ? (
              <button
                type="button"
                onClick={() => selectSection(activeIndex - 1)}
              >
                <span>{t("← 上一章")}</span>
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
                <span>{t("下一章 →")}</span>
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
            {t("编辑本章节")}
          </a>
          <a
            href={editHref}
            className="block px-3 py-2 text-left text-secondary hover:bg-raised"
          >
            {t("新建子章节")}
          </a>
          <a
            href={editHref}
            className="block px-3 py-2 text-left text-secondary hover:bg-raised"
          >
            {t("新建章节")}
          </a>
        </div>
      )}
    </div>
  );
}
