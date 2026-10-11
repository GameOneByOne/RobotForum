"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";
import { createPortal } from "react-dom";

function Lightbox({
  src,
  alt,
  close,
}: {
  src: string;
  alt: string;
  close: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return createPortal(
    <dialog
      ref={dialog}
      className="markdown-lightbox"
      aria-label={alt || "图片预览"}
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="markdown-lightbox-bar">
        <span>{alt}</span>
        <button type="button" onClick={close} autoFocus>
          关闭预览 ×
        </button>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} />
    </dialog>,
    document.body,
  );
}

export function MarkdownImage({
  alt = "",
  src,
  title,
}: ComponentPropsWithoutRef<"img">) {
  const [label, sizeValue, placeValue] = alt.split("|");
  const size = Number.parseFloat(sizeValue || "100");
  const width = `${Number.isFinite(size) ? Math.min(100, Math.max(0, size)) : 100}%`;
  const placement = /^(left|inline-left|左)$/.test(placeValue || "")
    ? "left"
    : /^(right|inline-right|右)$/.test(placeValue || "")
      ? "right"
      : "block";
  const source = typeof src === "string" ? src : "";
  const animated = /\.gif(?:[?#]|$)/i.test(source);
  const image = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const replayUrl = useRef<string | null>(null);
  const replayRequest = useRef<AbortController | null>(null);
  const [replaySrc, setReplaySrc] = useState("");
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [replaying, setReplaying] = useState(false);
  useEffect(
    () => () => {
      replayRequest.current?.abort();
      if (replayUrl.current) URL.revokeObjectURL(replayUrl.current);
    },
    [],
  );
  function freeze() {
    if (!image.current?.naturalWidth || !canvas.current) return;
    const frame = canvas.current;
    frame.width = image.current.naturalWidth;
    frame.height = image.current.naturalHeight;
    frame.getContext("2d")?.drawImage(image.current, 0, 0);
    setPaused(true);
  }
  async function replay() {
    replayRequest.current?.abort();
    const request = new AbortController();
    replayRequest.current = request;
    setReplaying(true);
    setError("");
    try {
      const response = await fetch(source, { signal: request.signal });
      if (!response.ok) throw new Error("image unavailable");
      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) throw new Error("not an image");
      if (request.signal.aborted) return;
      const freshUrl = URL.createObjectURL(blob);
      if (replayUrl.current) URL.revokeObjectURL(replayUrl.current);
      replayUrl.current = freshUrl;
      setReplaySrc(freshUrl);
      setPaused(false);
    } catch {
      if (!request.signal.aborted)
        setError("该图片来源暂不支持重播，可以继续播放或放大查看。");
    } finally {
      setReplaying(false);
    }
  }
  return (
    <span
      className={`markdown-figure markdown-figure-${placement}`}
      style={{ width }}
    >
      <span className="markdown-image-frame">
        <button
          type="button"
          className="markdown-image-open"
          aria-label={`放大图片：${label || "图解"}`}
          onClick={() => setOpen(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={image}
            src={replaySrc || src}
            alt={label}
            title={title}
            decoding="async"
            style={{ visibility: paused ? "hidden" : undefined }}
            onLoad={() => {
              setLoaded(true);
              if (
                animated &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
              )
                freeze();
            }}
          />
          <canvas
            ref={canvas}
            className="markdown-image-frozen"
            style={{ display: paused ? "block" : "none" }}
            aria-hidden="true"
          />
          <span className="markdown-image-hint">点击放大 ↗</span>
        </button>
      </span>
      <span className="markdown-figure-footer">
        {label && <span className="markdown-caption">图解 · {label}</span>}
        {animated && (
          <span className="markdown-animation-controls">
            <button
              type="button"
              disabled={!loaded}
              aria-pressed={paused}
              onClick={() => (paused ? setPaused(false) : freeze())}
            >
              {paused ? "播放动图" : "暂停动图"}
            </button>
            <button
              type="button"
              disabled={!loaded || replaying}
              onClick={replay}
            >
              {replaying ? "加载中…" : "重播"}
            </button>
          </span>
        )}
      </span>
      {error && (
        <span className="markdown-media-status" role="status">
          {error}
        </span>
      )}
      {open && (
        <Lightbox
          src={replaySrc || source}
          alt={label}
          close={() => setOpen(false)}
        />
      )}
    </span>
  );
}
