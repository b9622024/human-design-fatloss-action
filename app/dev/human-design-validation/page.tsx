"use client";

import { useState } from "react";

export default function HumanDesignValidationPage() {
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  async function runSuite() {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/dev/human-design-validation", { cache: "no-store" });
      setResult(await response.json());
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="eyebrow">INTERNAL VALIDATION TOOL</div>
        <h1 style={{ fontSize: "clamp(34px,6vw,58px)" }}>Human Design<br />Validation Suite</h1>
        <p className="lead">
          執行零 API 額度的 deterministic validation。包含 synthetic topology cases 與已凍結的 Golden Chart #001 reference snapshot。
        </p>
      </section>

      <section className="card" style={{ marginTop: 18 }}>
        <button
          type="button"
          onClick={runSuite}
          disabled={loading}
          style={{ padding: 15, border: 0, borderRadius: 999, background: "#17172d", color: "white", fontWeight: 700, fontSize: 15, width: "100%" }}
        >
          {loading ? "驗證中…" : "執行 Validation Suite"}
        </button>
        <p style={{ opacity: 0.68, lineHeight: 1.7, marginBottom: 0 }}>
          此頁不呼叫 Human Design Hub，因此不會消耗免費 API credits。新的真實 Golden Charts 會在下一階段另外加入。
        </p>
      </section>

      {result !== null && (
        <section className="card" style={{ marginTop: 18, overflow: "auto" }}>
          <h2 style={{ marginTop: 0 }}>Validation Result</h2>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12, lineHeight: 1.6 }}>{JSON.stringify(result, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}
