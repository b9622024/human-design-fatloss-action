"use client";

import { useState } from "react";

type Candidate = {
  id: string;
  localDateTime: string;
  timezone: string;
  chart: {
    type: string;
    authority: string;
    profile: string;
    definition: string;
  };
};

type DiscoveryResult = {
  selected?: Candidate[];
  coverage?: {
    types?: string[];
    authorities?: string[];
    definitions?: string[];
  };
  error?: string;
};

export default function HumanDesignGoldenPage() {
  const [discovery, setDiscovery] = useState<DiscoveryResult | null>(null);
  const [verification, setVerification] = useState<unknown>(null);
  const [discovering, setDiscovering] = useState(false);
  const [verifying, setVerifying] = useState(false);

  async function discover() {
    setDiscovering(true);
    setVerification(null);
    try {
      const response = await fetch("/api/dev/human-design-golden-discovery", { cache: "no-store" });
      setDiscovery(await response.json());
    } catch (error) {
      setDiscovery({ error: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setDiscovering(false);
    }
  }

  async function verify() {
    if (!discovery?.selected?.length) return;
    setVerifying(true);
    setVerification(null);
    try {
      const candidates = discovery.selected.slice(0, 9).map((candidate) => ({
        id: candidate.id,
        localDateTime: candidate.localDateTime,
        timezone: candidate.timezone,
      }));
      const response = await fetch("/api/dev/human-design-golden-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidates }),
      });
      setVerification(await response.json());
    } catch (error) {
      setVerification({ error: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setVerifying(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="eyebrow">INTERNAL GOLDEN TEST TOOL</div>
        <h1 style={{ fontSize: "clamp(34px,6vw,58px)" }}>Golden Chart<br />Discovery</h1>
        <p className="lead">
          先用自建引擎尋找具有不同 Type / Authority / Definition 的 deterministic test vectors，不消耗 HD Hub 額度。確認候選後，再手動按第二個按鈕做正式 Reference 驗證。
        </p>
      </section>

      <section className="card" style={{ marginTop: 18, display: "grid", gap: 12 }}>
        <button type="button" onClick={discover} disabled={discovering || verifying} style={{ padding: 15, border: 0, borderRadius: 999, background: "#17172d", color: "white", fontWeight: 700, fontSize: 15 }}>
          {discovering ? "搜尋中…" : "1. 搜尋 Golden 候選（0 API credits）"}
        </button>
        <button type="button" onClick={verify} disabled={verifying || discovering || !discovery?.selected?.length} style={{ padding: 15, border: "1px solid #17172d", borderRadius: 999, background: "white", color: "#17172d", fontWeight: 700, fontSize: 15 }}>
          {verifying ? "驗證中…" : "2. 用 HD Hub 驗證全部 9 組候選"}
        </button>
        <p style={{ opacity: 0.68, lineHeight: 1.7, margin: 0 }}>
          第二步會對 Human Design Hub 發出最多 9 次 reference requests，包含 Reflector 候選。只有你按下第二顆按鈕才會使用 API 額度。
        </p>
      </section>

      {discovery && (
        <section className="card" style={{ marginTop: 18, overflow: "auto" }}>
          <h2 style={{ marginTop: 0 }}>Discovery Result</h2>
          {discovery.selected?.length ? (
            <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
              {discovery.selected.map((candidate) => (
                <div key={candidate.id} style={{ border: "1px solid #e1ddd4", borderRadius: 14, padding: 14 }}>
                  <strong>{candidate.id}</strong><br />
                  {candidate.localDateTime} · {candidate.timezone}<br />
                  <span style={{ opacity: 0.72 }}>{candidate.chart.type} · {candidate.chart.authority} · {candidate.chart.profile} · {candidate.chart.definition}</span>
                </div>
              ))}
            </div>
          ) : null}
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12, lineHeight: 1.6 }}>{JSON.stringify(discovery, null, 2)}</pre>
        </section>
      )}

      {verification !== null && (
        <section className="card" style={{ marginTop: 18, overflow: "auto" }}>
          <h2 style={{ marginTop: 0 }}>HD Hub Golden Verification</h2>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12, lineHeight: 1.6 }}>{JSON.stringify(verification, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}
