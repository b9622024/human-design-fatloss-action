import { BodyGraph, BODYGRAPH_RENDERER_VERSION } from "@/components/human-design/BodyGraphV2";
import { normalizeBirthTime } from "@/lib/human-design/time";
import { solveDesignMoment } from "@/lib/human-design/design-moment";
import { buildHumanDesignActivations } from "@/lib/human-design/activations";
import { buildCoreHumanDesignChart } from "@/lib/human-design/topology";

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

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HumanDesignBodyGraphPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const localDateTime = typeof params.localDateTime === "string" ? params.localDateTime : "1989-01-17T11:45";
  const timezone = typeof params.timezone === "string" ? params.timezone : "Asia/Taipei";
  const shouldCalculate = params.calculate === "1";

  let result: ReturnType<typeof buildCoreHumanDesignChart> | null = null;
  let personalityActivations: ReturnType<typeof buildHumanDesignActivations> = [];
  let designActivations: ReturnType<typeof buildHumanDesignActivations> = [];
  let error: string | null = null;

  if (shouldCalculate) {
    try {
      const normalized = normalizeBirthTime(localDateTime, timezone);
      const birthUtc = new Date(normalized.utcDateTime);
      const designMoment = solveDesignMoment(birthUtc);
      const designUtc = new Date(designMoment.utcDateTime);
      personalityActivations = buildHumanDesignActivations(birthUtc);
      designActivations = buildHumanDesignActivations(designUtc);
      result = buildCoreHumanDesignChart(personalityActivations, designActivations);
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown calculation error";
    }
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
          {BODYGRAPH_RENDERER_VERSION} 使用目前較穩定的 canonical-slot renderer。這個開發頁改為伺服器端計算，不依賴手機 Safari 的 JavaScript hydration。
        </p>
      </section>

      <section style={{ ...cardStyle, marginTop: 18 }}>
        <form method="GET" style={{ display: "grid", gap: 16 }}>
          <input type="hidden" name="calculate" value="1" />
          <label style={{ display: "grid", gap: 8 }}>
            <strong style={{ fontSize: 17 }}>出生日期與時間</strong>
            <input
              type="datetime-local"
              name="localDateTime"
              defaultValue={localDateTime}
              style={{ padding: 15, borderRadius: 14, border: "1px solid #d9d4ca", fontSize: 16, background: "#fff" }}
            />
          </label>
          <label style={{ display: "grid", gap: 8 }}>
            <strong style={{ fontSize: 17 }}>IANA Timezone</strong>
            <input
              name="timezone"
              defaultValue={timezone}
              style={{ padding: 15, borderRadius: 14, border: "1px solid #d9d4ca", fontSize: 16, background: "#fff" }}
            />
          </label>
          <button
            type="submit"
            style={{ padding: 16, border: 0, borderRadius: 999, background: "#17172d", color: "white", fontWeight: 800, fontSize: 16 }}
          >
            產生 BodyGraph {BODYGRAPH_RENDERER_VERSION}
          </button>
        </form>
        <div style={{ marginTop: 12, fontSize: 13, color: "#706c67", textAlign: "center" }}>
          狀態：{error ? "計算失敗" : result ? "計算完成" : "待命"}
        </div>
        {error && (
          <div style={{ marginTop: 16, padding: 14, borderRadius: 14, background: "#fff0ee", border: "1px solid #e8a39a", color: "#9f2e25", lineHeight: 1.55 }}>
            <strong>計算失敗：</strong> {error}
          </div>
        )}
      </section>

      {result && (
        <section style={{ ...cardStyle, marginTop: 18 }}>
          <h2 style={{ marginTop: 0, color: "#17172d" }}>BodyGraph Preview {BODYGRAPH_RENDERER_VERSION}</h2>
          <p style={{ marginTop: -4, opacity: 0.68, lineHeight: 1.6 }}>
            黑色＝Personality，紅色＝Design。後續只針對支線、右側通道與 Gate 相對位置做局部校正。
          </p>
          <div style={{ display: "flex", justifyContent: "center", overflowX: "auto" }}>
            <BodyGraph
              chart={result}
              personalityActivations={personalityActivations}
              designActivations={designActivations}
              width={900}
            />
          </div>
        </section>
      )}
    </main>
  );
}
