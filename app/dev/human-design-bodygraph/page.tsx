"use client";

import { FormEvent, useState } from "react";
import { BodyGraph, BODYGRAPH_RENDERER_VERSION } from "@/components/human-design/BodyGraphV2";
import type { HumanDesignActivation } from "@/lib/human-design/activations";
import type { CoreHumanDesignChart } from "@/lib/human-design/topology";

type CalculationResult = {
  coreChart?: CoreHumanDesignChart;
  personalityActivations?: HumanDesignActivation[];
  designActivations?: HumanDesignActivation[];
  birthTime?: unknown;
  engine?: unknown;
  [key: string]: unknown;
};

export default function HumanDesignBodyGraphPage() {
  const [localDateTime, setLocalDateTime] = useState("1989-01-17T11:45");
  const [timezone, setTimezone] = useState("Asia/Taipei");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function calculate(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setCopied(false);
    try {
      const response = await fetch("/api/dev/human-design-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ localDateTime, timezone }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  async function copyJson() {
    if (!result) return;
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="eyebrow">BODYGRAPH DEVELOPMENT PREVIEW {BODYGRAPH_RENDERER_VERSION}</div>
        <h1 style={{ fontSize: "clamp(34px,6vw,58px)" }}>Human Design<br />BodyGraph SVG</h1>
        <p className="lead">
          {BODYGRAPH_RENDERER_VERSION} 已重建為 edge-derived geometry。Gate 數字直接由 Center 邊界計算，Channel 與 Gate 共用同一個 anchor，不再使用逐點手動補座標。
        </p>
      </section>

      <section className="card" style={{ marginTop: 18 }}>
        <form onSubmit={calculate} style={{ display: "grid", gap: 14 }}>
          <label style={{ display: "grid", gap: 7 }}>
            <strong>出生日期與時間</strong>
            <input type="datetime-local" value={localDateTime} onChange={(e) => setLocalDateTime(e.target.value)} style={{ padding: 14, borderRadius: 12, border: "1px solid #d9d4ca", fontSize: 16 }} />
          </label>
          <label style={{ display: "grid", gap: 7 }}>
            <strong>IANA Timezone</strong>
            <input value={timezone} onChange={(e) => setTimezone(e.target.value)} style={{ padding: 14, borderRadius: 12, border: "1px solid #d9d4ca", fontSize: 16 }} />
          </label>
          <button type="submit" disabled={loading} style={{ padding: 15, border: 0, borderRadius: 999, background: "#17172d", color: "white", fontWeight: 700, fontSize: 15 }}>
            {loading ? "計算中…" : `產生 BodyGraph ${BODYGRAPH_RENDERER_VERSION}`}
          </button>
        </form>
      </section>

      {result?.coreChart && (
        <section className="card" style={{ marginTop: 18 }}>
          <h2 style={{ marginTop: 0 }}>BodyGraph Preview {BODYGRAPH_RENDERER_VERSION}</h2>
          <p style={{ marginTop: -4, opacity: 0.68, lineHeight: 1.6 }}>
            黑色＝Personality，紅色＝Design。這一版改用固定中心骨架、邊界 Gate rails 與單一直線 Gate-to-Gate Channel，優先確保 Gate 相對位置正確、數字不堆疊、通道不要互相打架。
          </p>
          <div style={{ display: "flex", justifyContent: "center", overflowX: "auto" }}>
            <BodyGraph
              chart={result.coreChart}
              personalityActivations={result.personalityActivations ?? []}
              designActivations={result.designActivations ?? []}
              width={900}
            />
          </div>
        </section>
      )}

      {result && (
        <section className="card" style={{ marginTop: 18, overflow: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0 }}>Calculation JSON</h2>
            <button type="button" onClick={copyJson} style={{ padding: "10px 14px", borderRadius: 999, border: "1px solid #17172d", background: "white", color: "#17172d", fontWeight: 700 }}>
              {copied ? "已複製" : "一鍵複製 JSON"}
            </button>
          </div>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12, lineHeight: 1.6 }}>{JSON.stringify(result, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}
