"use client";

import { useState } from "react";

type Props = {
  reportJson: string;
  reportElementId: string;
};

export function ReportActions({ reportJson, reportElementId }: Props) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(reportJson);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("無法自動複製，請改用下方 JSON 文字區手動全選複製。");
    }
  }

  async function downloadPng() {
    setDownloading(true);
    setError(null);
    try {
      const source = document.getElementById(reportElementId);
      if (!source) throw new Error("找不到報告內容");

      const clone = source.cloneNode(true) as HTMLElement;
      clone.style.width = "900px";
      clone.style.maxWidth = "900px";
      clone.style.margin = "0";
      clone.style.background = "#f5f1e8";

      const wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.left = "-10000px";
      wrapper.style.top = "0";
      wrapper.style.width = "900px";
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      const height = Math.max(clone.scrollHeight, clone.getBoundingClientRect().height);
      const serialized = new XMLSerializer().serializeToString(clone);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="width:900px;background:#f5f1e8">${serialized}</div></foreignObject></svg>`;
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("報告轉圖失敗"));
        image.src = url;
      });

      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = 900 * scale;
      canvas.height = Math.ceil(height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("瀏覽器不支援 Canvas");
      ctx.scale(scale, scale);
      ctx.fillStyle = "#f5f1e8";
      ctx.fillRect(0, 0, 900, height);
      ctx.drawImage(image, 0, 0, 900, height);

      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => result ? resolve(result) : reject(new Error("PNG 產生失敗")), "image/png", 1);
      });
      const pngUrl = URL.createObjectURL(pngBlob);
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `human-design-fatloss-report-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(pngUrl);
      URL.revokeObjectURL(url);
      wrapper.remove();
    } catch (err) {
      setError(err instanceof Error ? err.message : "PNG 下載失敗");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <button type="button" onClick={() => void downloadPng()} disabled={downloading} style={{ padding: 15, borderRadius: 999, border: 0, background: "#17172d", color: "#fff", fontWeight: 800, fontSize: 15 }}>
        {downloading ? "正在產生 PNG…" : "下載 PNG 完整報告"}
      </button>
      <button type="button" onClick={() => void copyJson()} style={{ padding: 15, borderRadius: 999, border: "1px solid #17172d", background: "#fff", color: "#17172d", fontWeight: 800, fontSize: 15 }}>
        {copied ? "JSON 已複製" : "一鍵複製 JSON"}
      </button>
      {error && <div style={{ padding: 12, borderRadius: 12, background: "#fff0ee", color: "#9f2e25", lineHeight: 1.55 }}>{error}</div>}
    </div>
  );
}
