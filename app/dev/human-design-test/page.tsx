"use client";

import { FormEvent, useState } from "react";

export default function HumanDesignTestPage() {
  const [localDateTime, setLocalDateTime] = useState("1990-01-01T12:00");
  const [timezone, setTimezone] = useState("Asia/Taipei");
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="eyebrow">INTERNAL DEVELOPMENT TOOL</div>
        <h1 style={{ fontSize: "clamp(34px,6vw,58px)" }}>Human Design<br />Calculation Test</h1>
        <p className="lead">第一階段只驗證時區正規化、天文黃經與 88° Design Moment。這裡還不是正式人類圖。</p>
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
          <button type="submit" disabled={loading} style={{ padding: 15, border: 0, borderRadius: 999, background: "#17172d", color: "white", fontWeight: 700, fontSize: 15 }}>
            {loading ? "計算中…" : "執行第一階段計算"}
          </button>
        </form>
      </section>

      {result !== null && (
        <section className="card" style={{ marginTop: 18, overflow: "auto" }}>
          <h2 style={{ marginTop: 0 }}>Calculation JSON</h2>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12, lineHeight: 1.6 }}>{JSON.stringify(result, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}
