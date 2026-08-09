import { BodyGraph, BODYGRAPH_RENDERER_VERSION } from "@/components/human-design/BodyGraphV2";
import { ReportActions } from "@/components/assessment/ReportActions";
import { normalizeBirthTime } from "@/lib/human-design/time";
import { solveDesignMoment } from "@/lib/human-design/design-moment";
import { buildHumanDesignActivations } from "@/lib/human-design/activations";
import { buildCoreHumanDesignChart } from "@/lib/human-design/topology";
import { ANSWER_OPTIONS, BEHAVIOR_QUESTIONS, scoreBehaviorAssessment } from "@/lib/behavior/assessment";

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
  const answers = Object.fromEntries(BEHAVIOR_QUESTIONS.map((question) => [question.id, Number(getParam(params, question.id, "3"))]));
  const assessment = step === "3" ? scoreBehaviorAssessment(answers) : null;

  let chart: ReturnType<typeof buildCoreHumanDesignChart> | null = null;
  let personalityActivations: ReturnType<typeof buildHumanDesignActivations> = [];
  let designActivations: ReturnType<typeof buildHumanDesignActivations> = [];
  let error: string | null = null;

  if (step === "3" && !unknownTime) {
    try {
      if (!birthDate || !birthTime) throw new Error("缺少出生日期或出生時間。");
      const normalized = normalizeBirthTime(`${birthDate}T${birthTime}`, "Asia/Taipei");
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

  const reportPayload = step === "3" ? {
    schemaVersion: "human-design-fatloss-report-v1",
    generatedAt: new Date().toISOString(),
    birth: {
      date: birthDate,
      time: unknownTime ? null : birthTime,
      unknownTime,
      city: birthCity,
      timezone: "Asia/Taipei",
    },
    behaviorAssessment: {
      answers,
      result: assessment,
      questions: BEHAVIOR_QUESTIONS,
    },
    humanDesign: chart ? {
      rendererVersion: BODYGRAPH_RENDERER_VERSION,
      coreChart: chart,
      personalityActivations,
      designActivations,
    } : null,
    note: "此行為測驗為教練工具，不是醫療或心理診斷。",
  } : null;

  const reportJson = reportPayload ? JSON.stringify(reportPayload, null, 2) : "";

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
              ? "請依最近一個月最常出現的真實狀態作答，不用選理想中的自己。"
              : "第一版先服務台灣，時區固定使用 Asia/Taipei。"}
        </p>
      </section>

      {step === "1" && (
        <section style={{ ...cardStyle, marginTop: 18 }}>
          <form method="GET" style={{ display: "grid", gap: 16 }}>
            <input type="hidden" name="step" value="2" />
            <label style={{ display: "grid", gap: 8 }}><strong style={{ fontSize: 17 }}>出生日期</strong><input type="date" name="birthDate" required defaultValue={birthDate} style={inputStyle} /></label>
            <label style={{ display: "grid", gap: 8 }}>
              <strong style={{ fontSize: 17 }}>出生時間</strong>
              <input type="time" name="birthTime" defaultValue={birthTime} style={inputStyle} />
              <span style={{ color: "#706c67", fontSize: 14 }}>知道精確時間請填寫，不知道可勾選下方選項。</span>
            </label>
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", lineHeight: 1.5 }}>
              <input type="checkbox" name="unknownTime" value="1" defaultChecked={unknownTime} style={{ marginTop: 4, width: 18, height: 18 }} />
              <span><strong>我不知道出生時間</strong><br /><span style={{ color: "#706c67", fontSize: 14 }}>仍可完成行為測驗，但最後不顯示個人人類圖分析。</span></span>
            </label>
            <label style={{ display: "grid", gap: 8 }}>
              <strong style={{ fontSize: 17 }}>出生縣市</strong>
              <select name="birthCity" defaultValue={birthCity} style={inputStyle}>{TAIWAN_CITIES.map(city => <option key={city} value={city}>{city}</option>)}</select>
            </label>
            <button type="submit" style={buttonStyle}>下一步：開始行為測驗</button>
          </form>
        </section>
      )}

      {step === "2" && (
        <section style={{ ...cardStyle, marginTop: 18 }}>
          <form method="GET" style={{ display: "grid", gap: 20 }}>
            <input type="hidden" name="step" value="3" />
            <input type="hidden" name="birthDate" value={birthDate} />
            <input type="hidden" name="birthTime" value={birthTime} />
            <input type="hidden" name="birthCity" value={birthCity} />
            {unknownTime && <input type="hidden" name="unknownTime" value="1" />}

            {BEHAVIOR_QUESTIONS.map((question, index) => (
              <fieldset key={question.id} style={{ border: "1px solid #e2ddd4", borderRadius: 18, padding: 18, margin: 0 }}>
                <legend style={{ fontWeight: 800, color: "#17172d", padding: "0 8px" }}>第 {index + 1} 題</legend>
                <p style={{ margin: "4px 0 14px", lineHeight: 1.7, color: "#4f4b47" }}>{question.prompt}</p>
                <div style={{ display: "grid", gap: 9 }}>
                  {ANSWER_OPTIONS.map(option => (
                    <label key={option.value} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", border: "1px solid #e8e3db", borderRadius: 12 }}>
                      <input type="radio" name={question.id} value={option.value} required defaultChecked={option.value === 3} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}

            <button type="submit" style={buttonStyle}>完成測驗並查看結果</button>
          </form>
        </section>
      )}

      {step === "3" && assessment && (
        <>
          <div id="assessment-report" style={{ display: "grid", gap: 18, marginTop: 18 }}>
            <section style={cardStyle}>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".05em", opacity: 0.62 }}>HUMAN DESIGN × BEHAVIOR</div>
              <h2 style={{ margin: "10px 0 8px", color: "#17172d" }}>綜合結果</h2>
              <p style={{ margin: 0, color: "#706c67", lineHeight: 1.65 }}>出生地：{birthCity}。行為測驗為教練工具，不是醫療或心理診斷。</p>
            </section>

            <section style={cardStyle}>
              <h2 style={{ marginTop: 0, color: "#17172d" }}>六大行為維度</h2>
              <div style={{ display: "grid", gap: 14 }}>
                {assessment.dimensions.map(item => (
                  <div key={item.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontWeight: 700 }}><span>{item.label}</span><span>{item.score}</span></div>
                    <div style={{ height: 12, borderRadius: 999, background: "#ece7de", overflow: "hidden" }}><div style={{ width: `${item.score}%`, height: "100%", borderRadius: 999, background: "#17172d" }} /></div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12, marginTop: 20 }}>
                <div style={{ padding: 16, borderRadius: 16, background: "#f5f1e8" }}><div style={{ fontSize: 13, color: "#706c67" }}>Risk</div><strong style={{ fontSize: 28 }}>{assessment.risk}</strong></div>
                <div style={{ padding: 16, borderRadius: 16, background: "#f5f1e8" }}><div style={{ fontSize: 13, color: "#706c67" }}>Behavior Tension</div><strong style={{ fontSize: 28 }}>{assessment.behaviorTension}</strong></div>
              </div>
              <p style={{ marginBottom: 0, color: "#706c67", lineHeight: 1.65 }}>目前最強：{assessment.strongest.label}（{assessment.strongest.score}）；優先改善：{assessment.weakest.label}（{assessment.weakest.score}）。</p>
            </section>

            {unknownTime ? (
              <section style={cardStyle}><h2 style={{ marginTop: 0 }}>Human Design 暫不產生</h2><p style={{ margin: 0, color: "#706c67", lineHeight: 1.7 }}>你選擇了「不知道出生時間」，因此不使用任意時間代入。</p></section>
            ) : error ? (
              <section style={cardStyle}><div style={{ color: "#9f2e25" }}><strong>Human Design 計算失敗：</strong> {error}</div></section>
            ) : chart ? (
              <section style={cardStyle}>
                <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.62 }}>BODYGRAPH {BODYGRAPH_RENDERER_VERSION}</div>
                <h2 style={{ margin: "10px 0 6px", color: "#17172d" }}>你的人類圖</h2>
                <p style={{ margin: 0, color: "#706c67" }}>{chart.type} · {chart.authority} · {chart.profile} · {chart.definition}</p>
                <div style={{ display: "flex", justifyContent: "center", overflowX: "auto", marginTop: 18 }}><BodyGraph chart={chart} personalityActivations={personalityActivations} designActivations={designActivations} width={900} /></div>
              </section>
            ) : null}
          </div>

          <section style={{ ...cardStyle, marginTop: 18 }}>
            <h2 style={{ marginTop: 0, color: "#17172d" }}>匯出報告</h2>
            <p style={{ color: "#706c67", lineHeight: 1.6 }}>PNG 會輸出上方完整報告；JSON 可一鍵複製，之後直接貼給 GPT 做進一步解析。</p>
            <ReportActions reportJson={reportJson} reportElementId="assessment-report" />
            <details style={{ marginTop: 14 }}><summary style={{ cursor: "pointer", fontWeight: 700 }}>查看完整 JSON</summary><textarea readOnly value={reportJson} style={{ ...inputStyle, minHeight: 260, marginTop: 10, fontFamily: "monospace", fontSize: 12 }} /></details>
          </section>
        </>
      )}
    </main>
  );
}
