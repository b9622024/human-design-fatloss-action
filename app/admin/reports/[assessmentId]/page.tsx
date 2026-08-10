import { redirect, notFound } from "next/navigation";
import { BodyGraph, BODYGRAPH_RENDERER_VERSION } from "@/components/human-design/BodyGraphV2";
import { ReportActions } from "@/components/assessment/ReportActions";
import { BehaviorCharts } from "@/components/assessment/BehaviorCharts";
import { normalizeBirthTime } from "@/lib/human-design/time";
import { solveDesignMoment } from "@/lib/human-design/design-moment";
import { buildHumanDesignActivations } from "@/lib/human-design/activations";
import { buildCoreHumanDesignChart } from "@/lib/human-design/topology";
import { BEHAVIOR_QUESTIONS, scoreBehaviorAssessment } from "@/lib/behavior/assessment";
import { isAdminAuthenticated } from "@/lib/server/admin-auth";
import { getAssessmentReport } from "@/lib/server/report-store";

const shell = { minHeight: "100vh", background: "#f5f1e8", padding: "24px 14px 64px" } as const;
const card = { maxWidth: 980, margin: "0 auto", background: "#fff", border: "1px solid #ded9cf", borderRadius: 24, padding: "clamp(20px,5vw,34px)" } as const;

export default async function AdminReportDetailPage({ params }: { params: { assessmentId: string } }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/reports");

  const assessmentId = decodeURIComponent(params.assessmentId);
  const stored = await getAssessmentReport(assessmentId);
  if (!stored) notFound();

  const rawParams = stored.report_json?.params || {};
  const name = String(rawParams.name || stored.name || "");
  const birthDate = String(rawParams.birthDate || stored.birth_date || "");
  const unknownTime = String(rawParams.unknownTime || "") === "1";
  const birthTime = unknownTime ? "" : String(rawParams.birthTime || stored.birth_time || "").slice(0, 5);
  const birthCity = String(rawParams.birthCity || stored.birth_city || "");
  const answers = Object.fromEntries(BEHAVIOR_QUESTIONS.map(question => [question.id, Number(rawParams[question.id] || 3)]));
  const assessment = scoreBehaviorAssessment(answers);

  let chart: ReturnType<typeof buildCoreHumanDesignChart> | null = null;
  let personalityActivations: ReturnType<typeof buildHumanDesignActivations> = [];
  let designActivations: ReturnType<typeof buildHumanDesignActivations> = [];
  let error: string | null = null;

  if (!unknownTime && birthDate && birthTime) {
    try {
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

  const reportPayload = {
    schemaVersion: "human-design-fatloss-report-v5",
    assessmentId,
    generatedAt: new Date().toISOString(),
    submittedAt: stored.created_at,
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
  };
  const reportJson = JSON.stringify(reportPayload, null, 2);
  const humanSummary = chart ? `${chart.type} · ${chart.authority} · ${chart.profile} · ${chart.definition}` : "";

  return <main style={shell}>
    <div style={{maxWidth:980,margin:"0 auto 14px"}}><a href="/admin/reports/list" style={{color:"#17172d",fontWeight:800,textDecoration:"none"}}>← 返回報告列表</a></div>

    <section style={card}>
      <div style={{fontSize:13,fontWeight:800,opacity:.6}}>可樂吉健康研究所 · ADMIN REPORT</div>
      <h1 style={{fontSize:"clamp(30px,7vw,48px)",margin:"12px 0 8px",color:"#17172d"}}>{name || "未填姓名"}</h1>
      <p style={{margin:0,color:"#706c67",lineHeight:1.7}}>編號 {assessmentId} · {birthDate || "日期未知"} · {unknownTime ? "時間未知" : birthTime || "時間未知"} · {birthCity || "地點未知"}</p>
    </section>

    <section style={{...card,marginTop:16}}>
      <h2 style={{marginTop:0,color:"#17172d"}}>行為分析圖</h2>
      <div style={{overflowX:"auto"}}><BehaviorCharts assessment={assessment} name={name} birthDate={birthDate} birthTime={unknownTime ? null : birthTime} birthCity={birthCity} /></div>
    </section>

    {unknownTime ? (
      <section style={{...card,marginTop:16}}><h2 style={{marginTop:0}}>Human Design 暫不產生</h2><p style={{margin:0,color:"#706c67",lineHeight:1.7}}>填答者選擇「不知道出生時間」，因此不使用任意時間代入。</p></section>
    ) : error ? (
      <section style={{...card,marginTop:16}}><div style={{color:"#9f2e25"}}><strong>Human Design 計算失敗：</strong> {error}</div></section>
    ) : chart ? (
      <section style={{...card,marginTop:16}}>
        <div style={{fontSize:13,fontWeight:800,opacity:.62}}>BODYGRAPH {BODYGRAPH_RENDERER_VERSION}</div>
        <h2 style={{margin:"10px 0 6px",color:"#17172d"}}>人類圖</h2>
        <p style={{margin:0,color:"#706c67"}}>{humanSummary}</p>
        <div id="human-design-svg-source" style={{display:"flex",justifyContent:"center",overflowX:"auto",marginTop:18}}><BodyGraph chart={chart} personalityActivations={personalityActivations} designActivations={designActivations} width={900} /></div>
      </section>
    ) : null}

    <section style={{...card,marginTop:16}}>
      <h2 style={{marginTop:0,color:"#17172d"}}>後台匯出工具</h2>
      <p style={{color:"#706c67",lineHeight:1.6}}>下載 Human Design PNG、行為分析 PNG，或複製完整 JSON。</p>
      <ReportActions reportJson={reportJson} humanDesignElementId={chart ? "human-design-svg-source" : undefined} behaviorSvgId="behavior-report-svg" name={name} birthDate={birthDate} birthTime={unknownTime ? null : birthTime} birthCity={birthCity} humanSummary={humanSummary} />
      <details style={{marginTop:14}}>
        <summary style={{cursor:"pointer",fontWeight:700}}>查看完整 JSON</summary>
        <textarea readOnly value={reportJson} style={{width:"100%",boxSizing:"border-box",minHeight:300,marginTop:10,padding:12,border:"1px solid #d9d4ca",borderRadius:12,fontFamily:"monospace",fontSize:12}} />
      </details>
    </section>
  </main>;
}
