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

function esc(value: string) {
  return value.replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[ch] || ch));
}

function translateType(value: string) {
  const map: Record<string, string> = {
    Generator: "生產者",
    "Manifesting Generator": "顯示生產者",
    Projector: "投射者",
    Manifestor: "顯示者",
    Reflector: "反映者",
  };
  return map[value] ?? value;
}

function translateAuthority(value: string) {
  const map: Record<string, string> = {
    Sacral: "薦骨權威",
    Emotional: "情緒權威",
    Splenic: "脾臟權威",
    Ego: "意志力權威",
    Self: "自我投射權威",
    Mental: "環境權威",
    Lunar: "月亮週期權威",
  };
  return map[value] ?? value;
}

function translateDefinition(value: string) {
  const map: Record<string, string> = {
    "Single Definition": "單一定義",
    "Split Definition": "二分定義",
    "Triple Split Definition": "三分定義",
    "Quadruple Split Definition": "四分定義",
    "No Definition": "無定義",
  };
  return map[value] ?? value;
}

function parseHumanSummary(summary: string) {
  const parts = summary.split(" · ");
  return {
    type: parts[0] || "—",
    authority: parts[1] || "—",
    profile: parts[2] || "—",
    definition: parts[3] || "—",
  };
}

function buildHumanDesignFrame(svg: SVGSVGElement, meta: { name: string; birthDate: string; birthTime: string | null; birthCity: string; humanSummary: string }) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const summary = parseHumanSummary(meta.humanSummary);

  // The source BodyGraph is 900px wide. Export it as three coordinated crops:
  // left Design panel, enlarged core BodyGraph, and right Personality panel.
  // This preserves the original data while keeping the chart itself dominant.
  const leftViewBox = "0 15 190 360";
  const coreViewBox = "215 25 470 720";
  const rightViewBox = "710 15 190 360";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1600" width="900" height="1600">
    <rect width="900" height="1600" fill="#f7f3ea"/>

    <g transform="translate(20 20)">
      <rect width="860" height="230" rx="30" fill="#17172d"/>
      <text x="38" y="46" font-family="Arial, sans-serif" font-size="15" font-weight="800" fill="#d2a55c">可樂吉健康研究所</text>
      <text x="38" y="92" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#ffffff">Human Design 人類圖</text>
      <text x="38" y="121" font-family="Arial, sans-serif" font-size="14" fill="#d8d7e0">${esc(meta.humanSummary)}</text>
      <line x1="38" y1="140" x2="822" y2="140" stroke="#45445b"/>
      <text x="38" y="166" font-family="Arial, sans-serif" font-size="11" fill="#9998aa">姓名</text>
      <text x="38" y="194" font-family="Arial, sans-serif" font-size="15" fill="#ffffff">${esc(meta.name || "未填寫")}</text>
      <text x="235" y="166" font-family="Arial, sans-serif" font-size="11" fill="#9998aa">出生日期</text>
      <text x="235" y="194" font-family="Arial, sans-serif" font-size="15" fill="#ffffff">${esc(meta.birthDate || "—")}</text>
      <text x="438" y="166" font-family="Arial, sans-serif" font-size="11" fill="#9998aa">出生時間</text>
      <text x="438" y="194" font-family="Arial, sans-serif" font-size="15" fill="#ffffff">${esc(meta.birthTime || "未知")}</text>
      <text x="638" y="166" font-family="Arial, sans-serif" font-size="11" fill="#9998aa">出生地</text>
      <text x="638" y="194" font-family="Arial, sans-serif" font-size="15" fill="#ffffff">${esc(meta.birthCity || "—")}</text>
    </g>

    <rect x="20" y="270" width="860" height="1195" rx="30" fill="#fbfaf7" stroke="#ded9cf"/>

    <text x="48" y="320" font-family="Arial, sans-serif" font-size="17" font-weight="800" fill="#d84238">設計 Design</text>
    <text x="852" y="320" text-anchor="end" font-family="Arial, sans-serif" font-size="17" font-weight="800" fill="#17172d">人格 Personality</text>

    <svg x="34" y="332" width="175" height="520" viewBox="${leftViewBox}" preserveAspectRatio="xMinYMin meet">
      ${clone.innerHTML}
    </svg>

    <svg x="176" y="292" width="548" height="1055" viewBox="${coreViewBox}" preserveAspectRatio="xMidYMid meet">
      ${clone.innerHTML}
    </svg>

    <svg x="691" y="332" width="175" height="520" viewBox="${rightViewBox}" preserveAspectRatio="xMaxYMin meet">
      ${clone.innerHTML}
    </svg>

    <g transform="translate(48 1344)">
      <rect width="804" height="92" rx="20" fill="#f3eee4" stroke="#e1dacd"/>
      <line x1="201" y1="14" x2="201" y2="78" stroke="#ddd5c8"/>
      <line x1="402" y1="14" x2="402" y2="78" stroke="#ddd5c8"/>
      <line x1="603" y1="14" x2="603" y2="78" stroke="#ddd5c8"/>

      <text x="18" y="28" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#8b877f">類型 Type</text>
      <text x="18" y="55" font-family="Arial, sans-serif" font-size="14" font-weight="800" fill="#17172d">${esc(translateType(summary.type))}</text>
      <text x="18" y="74" font-family="Arial, sans-serif" font-size="10" fill="#77736c">${esc(summary.type)}</text>

      <text x="219" y="28" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#8b877f">權威 Authority</text>
      <text x="219" y="55" font-family="Arial, sans-serif" font-size="14" font-weight="800" fill="#17172d">${esc(translateAuthority(summary.authority))}</text>
      <text x="219" y="74" font-family="Arial, sans-serif" font-size="10" fill="#77736c">${esc(summary.authority)}</text>

      <text x="420" y="28" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#8b877f">人生角色 Profile</text>
      <text x="420" y="57" font-family="Arial, sans-serif" font-size="16" font-weight="800" fill="#17172d">${esc(summary.profile)}</text>

      <text x="621" y="28" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#8b877f">定義 Definition</text>
      <text x="621" y="55" font-family="Arial, sans-serif" font-size="14" font-weight="800" fill="#17172d">${esc(translateDefinition(summary.definition))}</text>
      <text x="621" y="74" font-family="Arial, sans-serif" font-size="10" fill="#77736c">${esc(summary.definition)}</text>
    </g>

    <text x="450" y="1500" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#706c67">人類圖是一張自我探索地圖，用來理解你的決策方式、能量運作與行動節奏。</text>
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
