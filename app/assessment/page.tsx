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

const inputStyle = {
  padding: 15,
  borderRadius: 14,
  border: "1px solid #d9d4ca",
  fontSize: 16,
  background: "#fff",
  width: "100%",
  boxSizing: "border-box",
} as const;

const buttonStyle = {
  padding: 16,
  border: 0,
  borderRadius: 999,
  background: "#17172d",
  color: "white",
  fontWeight: 800,
  fontSize: 16,
  textAlign: "center",
  textDecoration: "none",
} as const;

const TAIWAN_CITIES = [
  "台北市", "新北市", "基隆市", "桃園市", "新竹市", "新竹縣", "苗栗縣",
  "台中市", "彰化縣", "南投縣", "雲林縣", "嘉義市", "嘉義縣", "台南市",
  "高雄市", "屏東縣", "宜蘭縣", "花蓮縣", "台東縣", "澎湖縣", "金門縣", "連江縣",
] as const;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getParam(params: Record<string, string | string[] | undefined>, key: string, fallback = "") {
  return typeof params[key] === "string" ? params[key] as string : fallback;
}

export default async function AssessmentPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const step = getParam(params, "step", "1");
  const birthDate = getParam(params, "birthDate");
  const birthTime = getParam(params, "birthTime");
  const birthCity = getParam(params, "birthCity", "台北市");
  const unknownTime = getParam(params, "unknownTime") === "1";

  let chart: ReturnType<typeof buildCoreHumanDesignChart> | null = null;
  let personalityActivations: ReturnType<typeof buildHumanDesignActivations> = [];
  let designActivations: ReturnType<typeof buildHumanDesignActivations> = [];
  let error: string | null = null;

  const shouldBuildFinal = step === "3" && !unknownTime;
  if (shouldBuildFinal) {
    try {
      if (!birthDate || !birthTime) throw new Error("缺少出生日期或出生時間。");
      const localDateTime = `${birthDate}T${birthTime}`;
      const normalized = normalizeBirthTime(localDateTime, "Asia/Taipei");
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
          人類圖減脂行動測驗 · STEP {step === "3" ? "03" : step === "2" ? "02" : "01"}
        </div>
        <h1 style={{ fontSize: "clamp(34px,7vw,58px)", lineHeight: 1.04, margin: "18px 0 16px", color: "#17172d" }}>
          {step === "3" ? "你的綜合結果" : step === "2" ? "8 題行為測驗" : "先填出生資料"}
        </h1>
        <p style={{ margin: 0, fontSize: "clamp(17px,3.8vw,21px)", lineHeight: 1.65, color: "#706c67" }}>
          {step === "3"
            ? "最後一次呈現 Human Design 與行為測驗結果，避免前面的資訊影響作答。"
            : step === "2"
              ? "這一步只做行為測驗，不先揭露人類圖結果。完成後才進入綜合分析。"
              : "出生資料只用來準備最後的人類圖計算。第一版先服務台灣，時區固定使用 Asia/Taipei。"}
        </p>
      </section>

      {step === "1" && (
        <section style={{ ...cardStyle, marginTop: 18 }}>
          <form method="GET" style={{ display: "grid", gap: 16 }}>
            <input type="hidden" name="step" value="2" />
            <label style={{ display: "grid", gap: 8 }}>
              <strong style={{ fontSize: 17 }}>出生日期</strong>
              <input type="date" name="birthDate" required defaultValue={birthDate} style={inputStyle} />
            </label>

            <label style={{ display: "grid", gap: 8 }}>
              <strong style={{ fontSize: 17 }}>出生時間</strong>
              <input type="time" name="birthTime" defaultValue={birthTime} style={inputStyle} />
              <span style={{ color: "#706c67", fontSize: 14, lineHeight: 1.55 }}>
                若知道精確時間請填寫；不知道時可勾選下方選項。
              </span>
            </label>

            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", lineHeight: 1.5 }}>
              <input type="checkbox" name="unknownTime" value="1" defaultChecked={unknownTime} style={{ marginTop: 4, width: 18, height: 18 }} />
              <span>
                <strong>我不知道出生時間</strong><br />
                <span style={{ color: "#706c67", fontSize: 14 }}>仍可完成行為測驗，但最後不顯示個人人類圖分析。</span>
              </span>
            </label>

            <label style={{ display: "grid", gap: 8 }}>
              <strong style={{ fontSize: 17 }}>出生縣市</strong>
              <select name="birthCity" defaultValue={birthCity} style={inputStyle}>
                {TAIWAN_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
              <span style={{ color: "#706c67", fontSize: 14, lineHeight: 1.55 }}>
                第一版限定台灣出生地，系統內部固定使用 Asia/Taipei，不需要使用者選世界時區。
              </span>
            </label>

            <button type="submit" style={buttonStyle}>下一步：開始行為測驗</button>
          </form>
        </section>
      )}

      {step === "2" && (
        <section style={{ ...cardStyle, marginTop: 18 }}>
          <div style={{ padding: 16, borderRadius: 16, background: "#f5f1e8", lineHeight: 1.7, color: "#5f5a54" }}>
            <strong style={{ color: "#17172d" }}>流程骨架已完成。</strong><br />
            這裡將放正式 8 題行為測驗。題目與六大維度 scoring schema 尚未定稿，所以目前先不建立假的答案與分數。
          </div>

          <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid #e2ddd4", background: "#fff" }}>
                <strong>第 {index + 1} 題</strong>
                <span style={{ marginLeft: 8, color: "#8b867f" }}>等待正式題目與計分規則</span>
              </div>
            ))}
          </div>

          <form method="GET" style={{ marginTop: 20, display: "grid", gap: 12 }}>
            <input type="hidden" name="step" value="3" />
            <input type="hidden" name="birthDate" value={birthDate} />
            <input type="hidden" name="birthTime" value={birthTime} />
            <input type="hidden" name="birthCity" value={birthCity} />
            {unknownTime && <input type="hidden" name="unknownTime" value="1" />}
            <button type="submit" style={buttonStyle}>開發預覽：查看 STEP 03</button>
          </form>
        </section>
      )}

      {step === "3" && (
        <>
          <section style={{ ...cardStyle, marginTop: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".05em", opacity: 0.62 }}>
              HUMAN DESIGN × BEHAVIOR
            </div>
            <h2 style={{ margin: "10px 0 8px", color: "#17172d" }}>最終結果頁骨架</h2>
            <p style={{ margin: 0, color: "#706c67", lineHeight: 1.65 }}>
              出生地：{birthCity}。這一頁才會揭露 Human Design 與行為測驗圖表，並進一步做 Cross Analysis 與減脂行動建議。
            </p>
          </section>

          {unknownTime ? (
            <section style={{ ...cardStyle, marginTop: 18 }}>
              <h2 style={{ marginTop: 0, color: "#17172d" }}>Human Design 暫不產生</h2>
              <p style={{ margin: 0, color: "#706c67", lineHeight: 1.7 }}>
                你選擇了「不知道出生時間」。行為測驗與後續減脂分析仍可繼續，但不會用任意時間代入產生看似精準的人類圖。
              </p>
            </section>
          ) : error ? (
            <section style={{ ...cardStyle, marginTop: 18 }}>
              <div style={{ padding: 14, borderRadius: 14, background: "#fff0ee", border: "1px solid #e8a39a", color: "#9f2e25", lineHeight: 1.55 }}>
                <strong>Human Design 計算失敗：</strong> {error}
              </div>
            </section>
          ) : chart ? (
            <section style={{ ...cardStyle, marginTop: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".05em", opacity: 0.62 }}>
                BODYGRAPH {BODYGRAPH_RENDERER_VERSION}
              </div>
              <h2 style={{ margin: "10px 0 6px", color: "#17172d" }}>你的人類圖</h2>
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
          ) : null}

          <section style={{ ...cardStyle, marginTop: 18 }}>
            <h2 style={{ marginTop: 0, color: "#17172d" }}>行為測驗圖表</h2>
            <p style={{ margin: 0, color: "#706c67", lineHeight: 1.7 }}>
              六大維度、Risk、Behavior Tension 與 Cross Analysis 會在題庫與 scoring schema 確認後接入這裡。
            </p>
          </section>
        </>
      )}
    </main>
  );
}
