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

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function HumanDesignGoldenPage() {
  const [discovery, setDiscovery] = useState<DiscoveryResult | null>(null);
  const [verification, setVerification] = useState<unknown>(null);
  const [discovering, setDiscovering] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  async function copyJson(value: unknown, label: string) {
    try {
      await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied("COPY_FAILED");
      window.setTimeout(() => setCopied(null), 1800);
    }
  }

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
    const candidates = discovery.selected.slice(0, 9);
    setVerifying(true);
    setVerifyProgress(0);
    setVerification(null);

    const results: unknown[] = [];
    try {
      // HD Hub Free currently limits requests to 5/minute. Verify one candidate
      // per server request and space starts by 13 seconds so a rolling minute
      // never contains more than five provider calls.
      for (let index = 0; index < candidates.length; index += 1) {
        const candidate = candidates[index];
        const response = await fetch("/api/dev/human-design-golden-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidates: [
              {
                id: candidate.id,
                localDateTime: candidate.localDateTime,
                timezone: candidate.timezone,
              },
            ],
          }),
        });
        const payload = await response.json();
        const item = Array.isArray(payload.results) ? payload.results[0] : { id: candidate.id, ok: false, error: payload };
        results.push(item);
        setVerifyProgress(index + 1);

        if (index < candidates.length - 1) {
          await wait(13000);
        }
      }

      const successful = results.filter((item) => Boolean(item && typeof item === "object" && (item as { ok?: boolean }).ok));
      const failed = results.filter((item) => !Boolean(item && typeof item === "object" && (item as { ok?: boolean }).ok));
      const matched = successful.filter((item) => {
        if (!item || typeof item !== "object") return false;
        const diff = (item as { diff?: { status?: string } }).diff;
        return diff?.status === "CORE_CHART_MATCH";
      });

      setVerification({
        status:
          failed.length === 0 && matched.length === results.length
            ? "GOLDEN_BATCH_MATCH"
            : failed.length > 0
              ? "GOLDEN_BATCH_HAS_API_ERRORS"
              : "GOLDEN_BATCH_HAS_MISMATCH",
        requestedCount: candidates.length,
        apiAttempts: candidates.length,
        successCount: successful.length,
        errorCount: failed.length,
        coreChartMatchCount: matched.length,
        allMatch: failed.length === 0 && matched.length === results.length,
        pacing: "13 seconds between HD Hub requests to respect 5 requests/minute limit",
        results,
      });
    } catch (error) {
      setVerification({ error: error instanceof Error ? error.message : "Unknown error", partialResults: results });
    } finally {
      setVerifying(false);
    }
  }

  const buttonStyle = {
    padding: 11,
    border: "1px solid #17172d",
    borderRadius: 999,
    background: "white",
    color: "#17172d",
    fontWeight: 700,
    fontSize: 13,
  } as const;

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
          {verifying ? `驗證中 ${verifyProgress}/9…` : "2. 用 HD Hub 驗證全部 9 組候選"}
        </button>
        <p style={{ opacity: 0.68, lineHeight: 1.7, margin: 0 }}>
          為符合 HD Hub 每分鐘 5 次的限制，九組會逐筆驗證並間隔 13 秒。完整流程約需 2 分鐘，請保持此頁開啟。
        </p>
      </section>

      {discovery && (
        <section className="card" style={{ marginTop: 18, overflow: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Discovery Result</h2>
            <button type="button" onClick={() => copyJson(discovery, "DISCOVERY")} style={buttonStyle}>
              {copied === "DISCOVERY" ? "已複製" : "一鍵複製 JSON"}
            </button>
          </div>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>HD Hub Golden Verification</h2>
            <button type="button" onClick={() => copyJson(verification, "VERIFICATION")} style={buttonStyle}>
              {copied === "VERIFICATION" ? "已複製" : "一鍵複製 JSON"}
            </button>
          </div>
          {copied === "COPY_FAILED" ? <p style={{ color: "#a33" }}>複製失敗，請確認瀏覽器允許剪貼簿權限。</p> : null}
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12, lineHeight: 1.6 }}>{JSON.stringify(verification, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}
