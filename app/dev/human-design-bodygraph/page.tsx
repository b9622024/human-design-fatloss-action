"use client";

import { FormEvent, useState } from "react";
import { BodyGraph } from "@/components/human-design/BodyGraph";
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
        <div className="eyebrow">BODYGRAPH DEVELOPMENT PREVIEW V6</div>
        <h1 style={{ fontSize: "clamp(34px,6vw,58px)" }}>Human Design<br />BodyGraph SVG</h1>
        <p className="lead">
          V6 重新整理 36 條 Channel 的視覺軌道，改用較平滑的固定 rail routing，並縮短 Hanging Gate 半通道，減少上一版出現的折線感、漂浮線段與左右支線互相干擾。
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
            {loading ? "計算中…" : "產生 BodyGraph V6"}
          </button>
        </form>
      </section>

      {result?.coreChart && (
        <section className="card" style={{ marginTop: 18 }}>
          <h2 style={{ marginTop: 0 }}>BodyGraph Preview V6</h2>
          <p style={{ marginTop: -4, opacity: 0.68, lineHeight: 1.6 }}>
            黑色＝Personality，紅色＝Design。V6 採固定 Gate-to-Gate 軌道與平滑路徑，Hanging Gate 顯示較短，讓主要 Channel topology 更容易閱讀。
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
