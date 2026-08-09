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

export default async function AssessmentPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const localDateTime = typeof params.localDateTime === "string" ? params.localDateTime : "";
  const timezone = typeof params.timezone === "string" ? params.timezone : "Asia/Taipei";
  const shouldCalculate = params.calculate === "1";

  let chart: ReturnType<typeof buildCoreHumanDesignChart> | null = null;
  let personalityActivations: ReturnType<typeof buildHumanDesignActivations> = [];
  let designActivations: ReturnType<typeof buildHumanDesignActivations> = [];
  let error: string | null = null;

  if (shouldCalculate) {
    try {
      if (!localDateTime) throw new Error("請先輸入出生日期與時間。");
      const normalized = normalizeBirthTime(localDateTime, timezone);
      const birthUtc = new Date(normalized.utcDateTime);
      const designMoment = solveDesignMoment(birthUtc);
      const designUtc = new Date(designMoment.utcDateTime);
      personalityActivations = buildHumanDesignActivations(birthUtc);
      designActivations = buildHumanDesignActivations(designUtc);
      chart = buildCoreHumanDesignChart(personalityActivations, designActivations);
    } catch (err) {
      error = err instanceof Error ? err.message : "Human Design 計算失敗";
    }
  }

  return (
    <main style={shellStyle}>
      <section style={cardStyle}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".06em", opacity: 0.62 }}>
          人類圖減脂行動測驗 · STEP 01
        </div>
        <h1 style={{ fontSize: "clamp(34px,7vw,58px)", lineHeight: 1.04, margin: "18px 0 16px", color: "#17172d" }}>
          先建立你的人類圖
        </h1>
        <p style={{ margin: 0, fontSize: "clamp(17px,3.8vw,21px)", lineHeight: 1.65, color: "#706c67" }}>
          輸入出生資料後，系統會先建立 BodyGraph。下一階段再把行為測驗與減脂行動建議疊加上去。
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
              required
              defaultValue={localDateTime}
              style={{ padding: 15, borderRadius: 14, border: "1px solid #d9d4ca", fontSize: 16, background: "#fff" }}
            />
          </label>
          <label style={{ display: "grid", gap: 8 }}>
            <strong style={{ fontSize: 17 }}>IANA Timezone</strong>
            <input
              name="timezone"
              required
              defaultValue={timezone}
              style={{ padding: 15, borderRadius: 14, border: "1px solid #d9d4ca", fontSize: 16, background: "#fff" }}
            />
          </label>
          <button
            type="submit"
            style={{ padding: 16, border: 0, borderRadius: 999, background: "#17172d", color: "white", fontWeight: 800, fontSize: 16 }}
          >
            建立我的人類圖
          </button>
        </form>
        {error && (
          <div style={{ marginTop: 16, padding: 14, borderRadius: 14, background: "#fff0ee", border: "1px solid #e8a39a", color: "#9f2e25", lineHeight: 1.55 }}>
            <strong>計算失敗：</strong> {error}
          </div>
        )}
      </section>

      {chart && (
        <>
          <section style={{ ...cardStyle, marginTop: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".05em", opacity: 0.62 }}>
              BODYGRAPH {BODYGRAPH_RENDERER_VERSION}
            </div>
            <h2 style={{ margin: "10px 0 6px", color: "#17172d" }}>你的人類圖基礎結果</h2>
            <p style={{ margin: 0, color: "#706c67", lineHeight: 1.65 }}>
              {chart.type} · {chart.authority} · {chart.profile} · {chart.definition}
            </p>
            <div style={{ display: "flex", justifyContent: "center", overflowX: "auto", marginTop: 18 }}>
              <BodyGraph
                chart={chart}
                personalityActivations={personalityActivations}
                designActivations={designActivations}
                width={900}
              />
            </div>
          </section>

          <section style={{ ...cardStyle, marginTop: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".06em", opacity: 0.62 }}>
              STEP 02 · NEXT
            </div>
            <h2 style={{ margin: "10px 0 8px", color: "#17172d" }}>下一步：8 題行為測驗</h2>
            <p style={{ margin: 0, color: "#706c67", lineHeight: 1.65 }}>
              下一個開發階段會把六大行為維度、Risk 與 Behavior Tension 接到這份 Human Design 結果上，形成減脂行動建議。
            </p>
            <div style={{ marginTop: 16, padding: 14, borderRadius: 16, background: "#f5f1e8", color: "#5f5a54", lineHeight: 1.6 }}>
              BodyGraph 已完成接入正式流程骨架。行為題目尚未啟用，避免在題庫與計分規則確認前先做錯資料結構。
            </div>
          </section>
        </>
      )}
    </main>
  );
}
