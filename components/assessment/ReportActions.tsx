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

function profileDescription(value: string) {
  const map: Record<string, string> = {
    "1/3": "Investigator / Martyr",
    "1/4": "Investigator / Opportunist",
    "2/4": "Hermit / Opportunist",
    "2/5": "Hermit / Heretic",
    "3/5": "Martyr / Heretic",
    "3/6": "Martyr / Role Model",
    "4/6": "Opportunist / Role Model",
    "4/1": "Opportunist / Investigator",
    "5/1": "Heretic / Investigator",
    "5/2": "Heretic / Hermit",
    "6/2": "Role Model / Hermit",
    "6/3": "Role Model / Martyr",
  };
  return map[value] ?? "";
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
  const profileEnglish = profileDescription(summary.profile);

  // Export only changes framing/cropping. The BodyGraph geometry remains untouched,
  // so gates, centers, rails, and channels keep their canonical coordinates.
  const leftViewBox = "0 12 195 355";
  const coreViewBox = "250 28 400 705";
  const rightViewBox = "705 12 195 355";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1600" width="900" height="1600">
    <rect width="900" height="1600" fill="#f7f3ea"/>

    <g transform="translate(18 16)">
      <rect width="864" height="232" rx="30" fill="#17172d"/>
      <text x="38" y="46" font-family="Arial, sans-serif" font-size="15" font-weight="800" fill="#d2a55c">可樂吉健康研究所</text>
      <text x="38" y="92" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#ffffff">Human Design 人類圖</text>
      <text x="38" y="121" font-family="Arial, sans-serif" font-size="14" fill="#d8d7e0">${esc(meta.humanSummary)}</text>
      <line x1="38" y1="140" x2="826" y2="140" stroke="#45445b"/>
      <text x="38" y="166" font-family="Arial, sans-serif" font-size="11" fill="#9998aa">姓名</text>
      <text x="38" y="194" font-family="Arial, sans-serif" font-size="15" fill="#ffffff">${esc(meta.name || "未填寫")}</text>
      <text x="238" y="166" font-family="Arial, sans-serif" font-size="11" fill="#9998aa">出生日期</text>
      <text x="238" y="194" font-family="Arial, sans-serif" font-size="15" fill="#ffffff">${esc(meta.birthDate || "—")}</text>
      <text x="442" y="166" font-family="Arial, sans-serif" font-size="11" fill="#9998aa">出生時間</text>
      <text x="442" y="194" font-family="Arial, sans-serif" font-size="15" fill="#ffffff">${esc(meta.birthTime || "未知")}</text>
      <text x="642" y="166" font-family="Arial, sans-serif" font-size="11" fill="#9998aa">出生地</text>
      <text x="642" y="194" font-family="Arial, sans-serif" font-size="15" fill="#ffffff">${esc(meta.birthCity || "—")}</text>
    </g>

    <rect x="18" y="266" width="864" height="1252" rx="30" fill="#fbfaf7" stroke="#ded9cf"/>

    <text x="46" y="315" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="#d84238">設計 Design</text>
    <text x="854" y="315" text-anchor="end" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="#17172d">人格 Personality</text>

    <svg x="35" y="330" width="175" height="515" viewBox="${leftViewBox}" preserveAspectRatio="xMinYMin meet">
      ${clone.innerHTML}
    </svg>

    <svg x="145" y="300" width="610" height="1085" viewBox="${coreViewBox}" preserveAspectRatio="xMidYMid meet">
      ${clone.innerHTML}
    </svg>

    <svg x="690" y="330" width="175" height="515" viewBox="${rightViewBox}" preserveAspectRatio="xMaxYMin meet">
      ${clone.innerHTML}
    </svg>

    <g transform="translate(44 1350)">
      <rect width="812" height="112" rx="22" fill="#f3eee4" stroke="#e1dacd"/>
      <line x1="203" y1="16" x2="203" y2="96" stroke="#ddd5c8"/>
      <line x1="406" y1="16" x2="406" y2="96" stroke="#ddd5c8"/>
      <line x1="609" y1="16" x2="609" y2="96" stroke="#ddd5c8"/>

      <circle cx="25" cy="31" r="10" fill="#5aa06b"/>
      <text x="43" y="28" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#8b877f">類型 Type</text>
      <text x="18" y="60" font-family="Arial, sans-serif" font-size="15" font-weight="800" fill="#17172d">${esc(translateType(summary.type))}</text>
      <text x="18" y="82" font-family="Arial, sans-serif" font-size="10" fill="#77736c">${esc(summary.type)}</text>

      <circle cx="228" cy="31" r="10" fill="#d99a4d"/>
      <text x="246" y="28" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#8b877f">權威 Authority</text>
      <text x="221" y="60" font-family="Arial, sans-serif" font-size="15" font-weight="800" fill="#17172d">${esc(translateAuthority(summary.authority))}</text>
      <text x="221" y="82" font-family="Arial, sans-serif" font-size="10" fill="#77736c">${esc(summary.authority)}</text>

      <circle cx="431" cy="31" r="10" fill="#7772a9"/>
      <text x="449" y="28" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#8b877f">人生角色 Profile</text>
      <text x="424" y="60" font-family="Arial, sans-serif" font-size="16" font-weight="800" fill="#17172d">${esc(summary.profile)}</text>
      <text x="424" y="82" font-family="Arial, sans-serif" font-size="9.5" fill="#77736c">${esc(profileEnglish)}</text>

      <circle cx="634" cy="31" r="10" fill="#5d82b4"/>
      <text x="652" y="28" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#8b877f">定義 Definition</text>
      <text x="627" y="60" font-family="Arial, sans-serif" font-size="15" font-weight="800" fill="#17172d">${esc(translateDefinition(summary.definition))}</text>
      <text x="627" y="82" font-family="Arial, sans-serif" font-size="10" fill="#77736c">${esc(summary.definition)}</text>
    </g>

    <text x="450" y="1492" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#706c67">人類圖是一張自我探索地圖，用來理解你的決策方式、能量運作與行動節奏。</text>
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
