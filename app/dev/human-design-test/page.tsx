"use client";

import { FormEvent, useState } from "react";

export default function HumanDesignTestPage() {
  const [localDateTime, setLocalDateTime] = useState("1989-01-17T11:45");
  const [timezone, setTimezone] = useState("Asia/Taipei");
  const [result, setResult] = useState<unknown>(null);
  const [comparison, setComparison] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/dev/human-design-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ localDateTime, timezone }),
      });
      setResult(await response.json());
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setLoading(false);
    }
  }

  async function compareWithHub() {
    setComparing(true);
    setComparison(null);
    try {
      const response = await fetch("/api/dev/human-design-reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ localDateTime, timezone }),
      });
      setComparison(await response.json());
    } catch (error) {
      setComparison({ error: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setComparing(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="eyebrow">INTERNAL DEVELOPMENT TOOL</div>
        <h1 style={{ fontSize: "clamp(34px,6vw,58px)" }}>Human Design<br />Calculation Test</h1>
        <p className="lead">目前用來驗證時區、天文黃經、88° Design Moment，以及 Human Design Hub Free reference。這裡還不是正式人類圖。</p>
      </section>

      <section className="card" style={{ marginTop: 18 }}>
        <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
          <label style={{ display: "grid", gap: 8 }}>
            <strong>出生日期與時間</strong>
            <input type="datetime-local" value={localDateTime} onChange={(e) => setLocalDateTime(e.target.value)} style={{ padding: 14, borderRadius: 12, border: "1px solid #d9d4ca", fontSize: 16 }} />
          </label>
          <label style={{ display: "grid", gap: 8 }}>
            <strong>IANA Timezone</strong>
            <input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Asia/Taipei" style={{ padding: 14, borderRadius: 12, border: "1px solid #d9d4ca", fontSize: 16 }} />
          </label>
          <div style={{ display: "grid", gap: 10 }}>
            <button type="submit" disabled={loading || comparing} style={{ padding: 15, border: 0, borderRadius: 999, background: "#17172d", color: "white", fontWeight: 700, fontSize: 15 }}>
              {loading ? "計算中…" : "執行 Self Calculation"}
            </button>
            <button type="button" onClick={compareWithHub} disabled={loading || comparing} style={{ padding: 15, border: "1px solid #17172d", borderRadius: 999, background: "white", color: "#17172d", fontWeight: 700, fontSize: 15 }}>
              {comparing ? "比對中…" : "同時比對 HD Hub"}
            </button>
          </div>
        </form>
      </section>

      {result !== null && (
        <section className="card" style={{ marginTop: 18, overflow: "auto" }}>
          <h2 style={{ marginTop: 0 }}>Self Calculation JSON</h2>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12, lineHeight: 1.6 }}>{JSON.stringify(result, null, 2)}</pre>
        </section>
      )}

      {comparison !== null && (
        <section className="card" style={{ marginTop: 18, overflow: "auto" }}>
          <h2 style={{ marginTop: 0 }}>HD Hub Reference Comparison</h2>
          <p style={{ marginTop: 0, opacity: 0.72 }}>
            目前正式保存 HD Hub Free endpoint 的原始 response。因 Self Engine 尚未完成 Gate/Line mapping，所以 Diff 會明確標示哪些欄位仍不可比較，不會自行猜測。
          </p>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12, lineHeight: 1.6 }}>{JSON.stringify(comparison, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}
