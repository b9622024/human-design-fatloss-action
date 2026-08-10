"use client";

import { useState } from "react";

type Props = {
  reportJson: string;
  humanDesignElementId?: string;
  behaviorSvgId: string;
  name?: string;
  birthDate?: string;
  birthTime?: string | null;
  birthCity?: string;
  humanSummary?: string;
};

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 3000);
}

function getSvgMetrics(svg: SVGSVGElement) {
  const vb = svg.viewBox.baseVal;
  return {
    width: vb?.width || Number(svg.getAttribute("width")) || 900,
    height: vb?.height || Number(svg.getAttribute("height")) || 760,
  };
}

function esc(value: string) {
  return value.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[ch] || ch));
}

function buildHumanDesignFrame(svg: SVGSVGElement, meta: { name: string; birthDate: string; birthTime: string | null; birthCity: string; humanSummary: string }) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const { width, height } = getSvgMetrics(clone);

  const frameWidth = 900;
  const frameHeight = 1600;
  const chartTop = 300;
  const chartBottom = 80;
  const availableHeight = frameHeight - chartTop - chartBottom;
  const availableWidth = 820;
  const scale = Math.min(availableWidth / width, availableHeight / height);
  const drawWidth = width * scale;
  const x = (frameWidth - drawWidth) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1600" width="900" height="1600">
    <rect width="900" height="1600" fill="#f7f3ea"/>
    <g transform="translate(32 28)">
      <rect width="836" height="220" rx="28" fill="#17172d"/>
      <text x="30" y="42" font-family="Arial, sans-serif" font-size="15" font-weight="800" fill="#d2a55c">可樂吉健康研究所</text>
      <text x="30" y="86" font-family="Arial, sans-serif" font-size="32" font-weight="800" fill="#ffffff">Human Design 人類圖</text>
      <text x="30" y="114" font-family="Arial, sans-serif" font-size="14" fill="#d8d7e0">${esc(meta.humanSummary)}</text>
      <line x1="30" y1="132" x2="806" y2="132" stroke="#45445b"/>
      <text x="30" y="156" font-family="Arial, sans-serif" font-size="11" fill="#9998aa">姓名</text>
      <text x="30" y="180" font-family="Arial, sans-serif" font-size="15" fill="#ffffff">${esc(meta.name || "未填寫")}</text>
      <text x="220" y="156" font-family="Arial, sans-serif" font-size="11" fill="#9998aa">出生日期</text>
      <text x="220" y="180" font-family="Arial, sans-serif" font-size="15" fill="#ffffff">${esc(meta.birthDate || "—")}</text>
      <text x="420" y="156" font-family="Arial, sans-serif" font-size="11" fill="#9998aa">出生時間</text>
      <text x="420" y="180" font-family="Arial, sans-serif" font-size="15" fill="#ffffff">${esc(meta.birthTime || "未知")}</text>
      <text x="620" y="156" font-family="Arial, sans-serif" font-size="11" fill="#9998aa">出生地</text>
      <text x="620" y="180" font-family="Arial, sans-serif" font-size="15" fill="#ffffff">${esc(meta.birthCity || "—")}</text>
    </g>
    <g transform="translate(${x} ${chartTop}) scale(${scale})">${clone.innerHTML}</g>
    <text x="450" y="1574" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#8b877f">Human Design × Fat Loss Action Report</text>
  </svg>`;
}

async function svgElementToPng(svg: SVGSVGElement, filename: string, scale = 2, sourceOverride?: string) {
  const source = sourceOverride ?? (() => {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    return new XMLSerializer().serializeToString(clone);
  })();

  const outputWidth = 900;
  const outputHeight = 1600;
  const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("SVG 轉換圖片失敗"));
      image.src = svgUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(outputWidth * scale);
    canvas.height = Math.ceil(outputHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("瀏覽器不支援 Canvas");
    ctx.scale(scale, scale);
    ctx.fillStyle = "#f7f3ea";
    ctx.fillRect(0, 0, outputWidth, outputHeight);
    ctx.drawImage(image, 0, 0, outputWidth, outputHeight);

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(result => result ? resolve(result) : reject(new Error("PNG 產生失敗")), "image/png", 1);
    });

    triggerDownload(pngBlob, filename);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function findSvg(elementId: string) {
  const node = document.getElementById(elementId);
  if (!node) return null;
  if (node instanceof SVGSVGElement) return node;
  return node.querySelector("svg");
}

export function ReportActions({ reportJson, humanDesignElementId, behaviorSvgId, name = "", birthDate = "", birthTime = null, birthCity = "", humanSummary = "" }: Props) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
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

  async function downloadSvgPng(elementId: string, filename: string, mode: "human" | "behavior") {
    setBusy(mode);
    setError(null);
    try {
      const svg = findSvg(elementId);
      if (!svg) throw new Error("找不到可輸出的 SVG 圖表");
      const source = mode === "human" ? buildHumanDesignFrame(svg, { name, birthDate, birthTime, birthCity, humanSummary }) : undefined;
      await svgElementToPng(svg, filename, 2, source);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PNG 下載失敗");
    } finally {
      setBusy(null);
    }
  }

  function downloadJson() {
    triggerDownload(new Blob([reportJson], { type: "application/json;charset=utf-8" }), `human-design-fatloss-report-${new Date().toISOString().slice(0, 10)}.json`);
  }

  const secondaryButton = {
    padding: 15,
    borderRadius: 999,
    border: "1px solid #17172d",
    background: "#fff",
    color: "#17172d",
    fontWeight: 800,
    fontSize: 15,
  } as const;

  const primaryButton = {
    padding: 15,
    borderRadius: 999,
    border: 0,
    background: "#17172d",
    color: "#fff",
    fontWeight: 800,
    fontSize: 15,
  } as const;

  const date = new Date().toISOString().slice(0, 10);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {humanDesignElementId && (
        <button type="button" disabled={Boolean(busy)} onClick={() => void downloadSvgPng(humanDesignElementId, `human-design-${date}.png`, "human")} style={primaryButton}>
          {busy === "human" ? "正在產生人類圖 PNG…" : "下載人類圖 PNG（9:16）"}
        </button>
      )}
      <button type="button" disabled={Boolean(busy)} onClick={() => void downloadSvgPng(behaviorSvgId, `behavior-analysis-${date}.png`, "behavior")} style={primaryButton}>
        {busy === "behavior" ? "正在產生分析 PNG…" : "下載行為分析 PNG（9:16）"}
      </button>
      <button type="button" onClick={downloadJson} style={secondaryButton}>下載 JSON 完整資料</button>
      <button type="button" onClick={() => void copyJson()} style={secondaryButton}>{copied ? "JSON 已複製" : "一鍵複製 JSON"}</button>
      {error && <div style={{ padding: 12, borderRadius: 12, background: "#fff0ee", color: "#9f2e25", lineHeight: 1.55 }}>{error}</div>}
    </div>
  );
}
