"use client";

import { useState } from "react";
import { BodyGraph, BODYGRAPH_RENDERER_VERSION } from "@/components/human-design/BodyGraphV2";
import type { HumanDesignActivation } from "@/lib/human-design/activations";
import type { CoreHumanDesignChart } from "@/lib/human-design/topology";

type CalculationResult = {
  coreChart?: CoreHumanDesignChart;
  personalityActivations?: HumanDesignActivation[];
  designActivations?: HumanDesignActivation[];
  birthTime?: unknown;
  engine?: unknown;
  error?: string;
  [key: string]: unknown;
};

const shellStyle = {
  maxWidth: 980,
  margin: "0 auto",
  padding: "24px 16px 80px",
  background: "#f5f1e8",
  minHeight: "100vh",
} as const;

const cardStyle = {
  background: "#fff",
  border: "1px solid #ded9cf",
  borderRadius: 28,
  padding: "clamp(22px,5vw,42px)",
  boxShadow: "0 8px 24px rgba(23,23,45,0.05)",
} as const;

export default function HumanDesignBodyGraphPage() {
  const [localDateTime, setLocalDateTime] = useState("1989-01-17T11:45");
  const [timezone, setTimezone] = useState("Asia/Taipei");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("待命");

  async function calculate() {
    if (loading) return;
    setLoading(true);
    setStatus("正在送出計算請求…");
    setCopied(false);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/dev/human-design-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ localDateTime, timezone }),
      });

      setStatus(`API 已回應（HTTP ${response.status}）`);
      const data = (await response.json()) as CalculationResult;
      if (!response.ok) {
        throw new Error(data.error || `Calculation failed (${response.status})`);
      }
      if (!data.coreChart) {
        throw new Error(data.error || "Calculation completed but coreChart was not returned.");
      }
      setResult(data);
      setStatus("計算完成，BodyGraph 已產生");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown calculation error";
      setError(message);
      setStatus("計算失敗");
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
    <main style={shellStyle}>
      <section style={cardStyle}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".06em", opacity: 0.62 }}>
          BODYGRAPH DEVELOPMENT PREVIEW {BODYGRAPH_RENDERER_VERSION}
        </div>
        <h1 style={{ fontSize: "clamp(36px,7vw,62px)", lineHeight: 1.02, margin: "18px 0 16px", color: "#17172d" }}>
          Human Design<br />BodyGraph SVG
        </h1>
        <p style={{ margin: 0, fontSize: "clamp(17px,3.8vw,22px)", lineHeight: 1.65, color: "#706c67" }}>
          {BODYGRAPH_RENDERER_VERSION} 使用目前較穩定的 canonical-slot renderer。後續只針對支線與右側通道做局部校正，不再整體重排中心與 Gate。
        </p>
      </section>

      <section style={{ ...cardStyle, marginTop: 18 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <label style={{ display: "grid", gap: 8 }}>
            <strong style={{ fontSize: 17 }}>出生日期與時間</strong>
            <input
              type="datetime-local"
              value={localDateTime}
              onChange={(e) => setLocalDateTime(e.target.value)}
              style={{ padding: 15, borderRadius: 14, border: "1px solid #d9d4ca", fontSize: 16, background: "#fff" }}
            />
          </label>
          <label style={{ display: "grid", gap: 8 }}>
            <strong style={{ fontSize: 17 }}>IANA Timezone</strong>
            <input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              style={{ padding: 15, borderRadius: 14, border: "1px solid #d9d4ca", fontSize: 16, background: "#fff" }}
            />
          </label>
          <button
            type="button"
            onClick={() => void calculate()}
            disabled={loading}
            style={{ padding: 16, border: 0, borderRadius: 999, background: "#17172d", color: "white", fontWeight: 800, fontSize: 16, opacity: loading ? 0.65 : 1, cursor: loading ? "wait" : "pointer" }}
          >
            {loading ? "計算中…" : `產生 BodyGraph ${BODYGRAPH_RENDERER_VERSION}`}
          </button>
          <div style={{ fontSize: 13, color: "#706c67", textAlign: "center" }}>狀態：{status}</div>
        </div>

        {error && (
          <div style={{ marginTop: 16, padding: 14, borderRadius: 14, background: "#fff0ee", border: "1px solid #e8a39a", color: "#9f2e25", lineHeight: 1.55 }}>
            <strong>計算失敗：</strong> {error}
          </div>
        )}
      </section>

      {result?.coreChart && (
        <section style={{ ...cardStyle, marginTop: 18 }}>
          <h2 style={{ marginTop: 0, color: "#17172d" }}>BodyGraph Preview {BODYGRAPH_RENDERER_VERSION}</h2>
          <p style={{ marginTop: -4, opacity: 0.68, lineHeight: 1.6 }}>
            黑色＝Personality，紅色＝Design。此頁先回到目前線條最穩定的基準，再逐段對照參考圖修正支線、右側通道與 Gate 相對位置。
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
        <section style={{ ...cardStyle, marginTop: 18, overflow: "auto" }}>
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
