"use client";

import { useState } from "react";

export default function HumanDesignValidationPage() {
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function runSuite() {
    setLoading(true);
    setResult(null);
    setCopied(false);
    try {
      const response = await fetch("/api/dev/human-design-validation", { cache: "no-store" });
      setResult(await response.json());
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (result === null) return;
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="eyebrow">INTERNAL VALIDATION TOOL</div>
        <h1 style={{ fontSize: "clamp(34px,6vw,58px)" }}>Human Design<br />Validation Suite</h1>
        <p className="lead">
          執行零 API 額度的 deterministic regression validation。包含 synthetic topology cases 與 10 組已由 HD Hub 驗證並凍結的 Golden Charts。
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
          這個頁面之後仍會保留，作為每次修改 Human Design 運算核心後的回歸測試。它不呼叫 Human Design Hub，因此不消耗 API credits。
        </p>
      </section>

      {result !== null && (
        <section className="card" style={{ marginTop: 18, overflow: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0 }}>Validation Result</h2>
            <button
              type="button"
              onClick={copyResult}
              style={{ padding: "10px 14px", borderRadius: 999, border: "1px solid #17172d", background: "white", color: "#17172d", fontWeight: 700, cursor: "pointer" }}
            >
              {copied ? "已複製" : "一鍵複製 JSON"}
            </button>
          </div>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12, lineHeight: 1.6 }}>{JSON.stringify(result, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}
