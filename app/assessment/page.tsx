import { BodyGraph, BODYGRAPH_RENDERER_VERSION } from "@/components/human-design/BodyGraphV2";
import { ReportActions } from "@/components/assessment/ReportActions";
import { BehaviorCharts } from "@/components/assessment/BehaviorCharts";
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
  maxWidth: "100%",
  minWidth: 0,
  display: "block",
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
  display: "block",
  width: "100%",
  boxSizing: "border-box",
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

function carryHiddenInputs(params: Record<string, string | string[] | undefined>, exclude: string[] = []) {
  return Object.entries(params)
    .filter(([key, value]) => typeof value === "string" && !exclude.includes(key))
    .map(([key, value]) => <input key={key} type="hidden" name={key} value={value as string} />);
}

function queryWith(params: Record<string, string | string[] | undefined>, changes: Record<string, string>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string") query.set(key, value);
  });
  Object.entries(changes).forEach(([key, value]) => query.set(key, value));
  return `/assessment?${query.toString()}`;
}

function makeAssessmentId(name: string, birthDate: string, answers: Record<string, number>) {
  const raw = `${name}|${birthDate}|${BEHAVIOR_QUESTIONS.map(q => answers[q.id] ?? 0).join("")}`;
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const suffix = (hash >>> 0).toString(36).toUpperCase().padStart(7, "0").slice(-7);
  return `HD-${birthDate.replace(/-/g, "").slice(2)}-${suffix}`;
}

export default async function AssessmentPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const step = getParam(params, "step", "1");
  const name = getParam(params, "name");
  const birthDate = getParam(params, "birthDate");
  const birthTime = getParam(params, "birthTime");
  const birthCity = getParam(params, "birthCity", "台北市");
  const unknownTime = getParam(params, "unknownTime") === "1";
  const questionIndex = Math.min(BEHAVIOR_QUESTIONS.length - 1, Math.max(0, Number(getParam(params, "q", "1")) - 1));
  const answers = Object.fromEntries(BEHAVIOR_QUESTIONS.map((question) => [question.id, Number(getParam(params, question.id, "3"))]));
  const assessment = step === "3" ? scoreBehaviorAssessment(answers) : null;
  const assessmentId = step === "3" ? makeAssessmentId(name, birthDate, answers) : "";
  const developerPreview = process.env.NODE_ENV !== "production" && getParam(params, "preview") === "1";

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
    schemaVersion: "human-design-fatloss-report-v4",
    assessmentId,
    generatedAt: new Date().toISOString(),
    profile: { name },
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
  const humanSummary = chart ? `${chart.type} · ${chart.authority} · ${chart.profile} · ${chart.definition}` : "";

  return (
    <main style={shellStyle}>
      <section style={cardStyle}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".06em", opacity: 0.62 }}>
          人類圖減脂行動測驗 · STEP {step === "3" ? "03" : step === "2" ? "02" : "01"}
        </div>
        <h1 style={{ fontSize: "clamp(34px,7vw,58px)", lineHeight: 1.04, margin: "18px 0 16px", color: "#17172d" }}>
          {step === "3" ? "測驗已完成" : step === "2" ? "18 題行為測驗" : "先填基本資料"}
        </h1>
        <p style={{ margin: 0, fontSize: "clamp(17px,3.8vw,21px)", lineHeight: 1.65, color: "#706c67" }}>
          {step === "3"
            ? "你的資料已完成計算。正式版本將由後台產生完整報告，再由崇銘老師提供給你。"
            : step === "2"
              ? "一次只回答一題。請依最近一個月最常出現的真實狀態作答，不用選理想中的自己。"
              : "請填寫出生資料，完成後會直接進入行為測驗。"}
        </p>
      </section>

      {step === "1" && (
        <section style={{ ...cardStyle, marginTop: 18, overflow: "hidden" }}>
          <form method="GET" style={{ display: "grid", gap: 16, minWidth: 0 }}>
            <input type="hidden" name="step" value="2" />
            <input type="hidden" name="q" value="1" />
            <label style={{ display: "grid", gap: 8, minWidth: 0 }}>
              <strong style={{ fontSize: 17 }}>姓名</strong>
              <input type="text" name="name" required defaultValue={name} placeholder="請輸入姓名或暱稱" style={inputStyle} />
            </label>
            <label style={{ display: "grid", gap: 8, minWidth: 0 }}>
              <strong style={{ fontSize: 17 }}>出生日期</strong>
              <input type="date" name="birthDate" required defaultValue={birthDate} style={inputStyle} />
            </label>
            <label style={{ display: "grid", gap: 8, minWidth: 0 }}>
              <strong style={{ fontSize: 17 }}>出生時間</strong>
              <input type="time" name="birthTime" defaultValue={birthTime} style={inputStyle} />
              <span style={{ color: "#706c67", fontSize: 14 }}>知道精確時間請填寫，不知道可勾選下方選項。</span>
            </label>
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", lineHeight: 1.5, minWidth: 0 }}>
              <input type="checkbox" name="unknownTime" value="1" defaultChecked={unknownTime} style={{ marginTop: 4, width: 18, height: 18, flex: "0 0 auto" }} />
              <span><strong>我不知道出生時間</strong><br /><span style={{ color: "#706c67", fontSize: 14 }}>仍可完成行為測驗，但最後不顯示個人人類圖分析。</span></span>
            </label>
            <label style={{ display: "grid", gap: 8, minWidth: 0 }}>
              <strong style={{ fontSize: 17 }}>出生縣市</strong>
              <select name="birthCity" defaultValue={birthCity} style={inputStyle}>{TAIWAN_CITIES.map(city => <option key={city} value={city}>{city}</option>)}</select>
            </label>
            <button type="submit" style={buttonStyle}>下一步：開始行為測驗</button>
          </form>
        </section>
      )}

      {step === "2" && (() => {
        const question = BEHAVIOR_QUESTIONS[questionIndex];
        const currentNumber = questionIndex + 1;
        const isLast = currentNumber === BEHAVIOR_QUESTIONS.length;
        const progress = Math.round((currentNumber / BEHAVIOR_QUESTIONS.length) * 100);
        const previousUrl = currentNumber > 1 ? queryWith(params, { q: String(currentNumber - 1) }) : null;

        return (
          <section style={{ ...cardStyle, marginTop: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 10 }}>
              <strong style={{ color: "#17172d" }}>第 {currentNumber} / {BEHAVIOR_QUESTIONS.length} 題</strong>
              <span style={{ color: "#706c67", fontSize: 14 }}>{progress}%</span>
            </div>
            <div style={{ height: 10, borderRadius: 999, background: "#ece7de", overflow: "hidden", marginBottom: 28 }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "#17172d", borderRadius: 999 }} />
            </div>

            <form method="GET" style={{ display: "grid", gap: 18 }}>
              {carryHiddenInputs(params, ["q", question.id, "step"])}
              <input type="hidden" name="step" value={isLast ? "3" : "2"} />
              {!isLast && <input type="hidden" name="q" value={String(currentNumber + 1)} />}

              <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                <legend style={{ fontWeight: 800, color: "#17172d", fontSize: "clamp(22px,5vw,30px)", lineHeight: 1.45, marginBottom: 22 }}>
                  {question.prompt}
                </legend>
                <div style={{ display: "grid", gap: 10 }}>
                  {ANSWER_OPTIONS.map(option => (
                    <label key={option.value} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 15px", border: "1px solid #e2ddd4", borderRadius: 14, background: "#fff", lineHeight: 1.45 }}>
                      <input type="radio" name={question.id} value={option.value} required defaultChecked={getParam(params, question.id) === String(option.value)} style={{ width: 19, height: 19, flex: "0 0 auto" }} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <button type="submit" style={buttonStyle}>{isLast ? "送出測驗" : "下一題"}</button>
              {previousUrl && <a href={previousUrl} style={{ textAlign: "center", color: "#5f5a54", fontWeight: 700, textDecoration: "none", padding: 10 }}>← 上一題</a>}
            </form>
          </section>
        );
      })()}

      {step === "3" && assessment && !developerPreview && (
        <section style={{ ...cardStyle, marginTop: 18, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, margin: "0 auto 18px", borderRadius: "50%", display: "grid", placeItems: "center", background: "#17172d", color: "#fff", fontSize: 30, fontWeight: 900 }}>✓</div>
          <h2 style={{ margin: "0 0 12px", fontSize: "clamp(28px,6vw,40px)", color: "#17172d" }}>謝謝你完成測驗</h2>
          <p style={{ margin: "0 auto", maxWidth: 620, color: "#706c67", lineHeight: 1.8, fontSize: 17 }}>完整的人類圖與減脂行為分析將由後台整理。請保存下面的測驗編號，並跟崇銘老師領取你的完整解析報告。</p>
          <div style={{ margin: "28px auto 20px", maxWidth: 520, padding: "22px 18px", borderRadius: 20, background: "#f5f1e8", border: "1px solid #ded9cf" }}>
            <div style={{ fontSize: 13, color: "#706c67", marginBottom: 8 }}>你的測驗編號</div>
            <div style={{ fontSize: "clamp(24px,6vw,34px)", fontWeight: 900, letterSpacing: ".04em", color: "#17172d", wordBreak: "break-word" }}>{assessmentId}</div>
          </div>
          <div style={{ fontWeight: 800, color: "#17172d", fontSize: 18 }}>請跟崇銘老師領取完整報告</div>
          {process.env.NODE_ENV !== "production" && (
            <a href={queryWith(params, { preview: "1" })} style={{ display: "inline-block", marginTop: 26, color: "#706c67", fontWeight: 700, fontSize: 13 }}>開發預覽：查看後台報告</a>
          )}
        </section>
      )}

      {step === "3" && assessment && developerPreview && (
        <>
          <section style={{ ...cardStyle, marginTop: 18, background: "#fff8e8", borderColor: "#e7d7a5" }}>
            <strong style={{ color: "#7c641d" }}>開發預覽模式</strong>
            <p style={{ margin: "8px 0 0", color: "#706c67", lineHeight: 1.65 }}>這個區塊只在開發環境顯示，方便目前調整報告。正式 production 不會讓填答者看到。</p>
          </section>

          <div style={{ display: "grid", gap: 18, marginTop: 18 }}>
            <section style={cardStyle}>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".05em", opacity: 0.62 }}>HUMAN DESIGN × BEHAVIOR</div>
              <h2 style={{ margin: "10px 0 8px", color: "#17172d" }}>後台報告預覽</h2>
              <p style={{ margin: 0, color: "#706c67", lineHeight: 1.65 }}>編號 {assessmentId} · {name} · {birthDate} · {unknownTime ? "時間未知" : birthTime} · {birthCity}</p>
            </section>

            <section style={cardStyle}>
              <h2 style={{ marginTop: 0, color: "#17172d" }}>行為分析圖</h2>
              <p style={{ margin: "0 0 18px", color: "#706c67", lineHeight: 1.65 }}>包含六大行為輪廓、執行偏好、減脂阻力風險與行動優先順序。</p>
              <div style={{ overflowX: "auto" }}><BehaviorCharts assessment={assessment} name={name} birthDate={birthDate} birthTime={unknownTime ? null : birthTime} birthCity={birthCity} /></div>
            </section>

            {unknownTime ? (
              <section style={cardStyle}><h2 style={{ marginTop: 0 }}>Human Design 暫不產生</h2><p style={{ margin: 0, color: "#706c67", lineHeight: 1.7 }}>你選擇了「不知道出生時間」，因此不使用任意時間代入。</p></section>
            ) : error ? (
              <section style={cardStyle}><div style={{ color: "#9f2e25" }}><strong>Human Design 計算失敗：</strong> {error}</div></section>
            ) : chart ? (
              <section style={cardStyle}>
                <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.62 }}>BODYGRAPH {BODYGRAPH_RENDERER_VERSION}</div>
                <h2 style={{ margin: "10px 0 6px", color: "#17172d" }}>你的人類圖</h2>
                <p style={{ margin: 0, color: "#706c67" }}>{humanSummary}</p>
                <div id="human-design-svg-source" style={{ display: "flex", justifyContent: "center", overflowX: "auto", marginTop: 18 }}><BodyGraph chart={chart} personalityActivations={personalityActivations} designActivations={designActivations} width={900} /></div>
              </section>
            ) : null}
          </div>

          <section style={{ ...cardStyle, marginTop: 18 }}>
            <h2 style={{ marginTop: 0, color: "#17172d" }}>後台匯出工具</h2>
            <p style={{ color: "#706c67", lineHeight: 1.6 }}>兩張 PNG 均為 9:16 直式報告版型。這些下載功能之後會移到真正的後台頁面。</p>
            <ReportActions reportJson={reportJson} humanDesignElementId={chart ? "human-design-svg-source" : undefined} behaviorSvgId="behavior-report-svg" name={name} birthDate={birthDate} birthTime={unknownTime ? null : birthTime} birthCity={birthCity} humanSummary={humanSummary} />
            <details style={{ marginTop: 14 }}>
              <summary style={{ cursor: "pointer", fontWeight: 700 }}>查看完整 JSON</summary>
              <textarea readOnly value={reportJson} style={{ ...inputStyle, minHeight: 260, marginTop: 10, fontFamily: "monospace", fontSize: 12 }} />
            </details>
          </section>
        </>
      )}
    </main>
  );
}
