import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/server/admin-auth";
import { listAssessmentReports } from "@/lib/server/report-store";

const shell = { minHeight: "100vh", background: "#f5f1e8", padding: "24px 14px 64px" } as const;
const card = { maxWidth: 980, margin: "0 auto", background: "#fff", border: "1px solid #ded9cf", borderRadius: 24, padding: "clamp(20px,5vw,34px)" } as const;

export default async function AdminReportListPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/reports");

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const reports = await listAssessmentReports(q);

  return <main style={shell}>
    <section style={card}>
      <div style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:13,fontWeight:800,opacity:.6}}>可樂吉健康研究所 · ADMIN</div>
          <h1 style={{margin:"10px 0 6px",fontSize:"clamp(30px,7vw,48px)",color:"#17172d"}}>測驗報告</h1>
          <p style={{margin:0,color:"#706c67"}}>依測驗編號或姓名搜尋，最多顯示最近 100 筆。</p>
        </div>
        <form method="POST" action="/admin/reports/logout"><button style={{padding:"10px 15px",borderRadius:999,border:"1px solid #d8d2c8",background:"#fff",fontWeight:800}}>登出</button></form>
      </div>

      <form method="GET" style={{display:"flex",gap:10,marginTop:24,flexWrap:"wrap"}}>
        <input name="q" defaultValue={q} placeholder="輸入姓名或測驗編號" style={{flex:"1 1 240px",minWidth:0,padding:14,borderRadius:14,border:"1px solid #d9d4ca",fontSize:16}} />
        <button style={{padding:"14px 22px",border:0,borderRadius:999,background:"#17172d",color:"white",fontWeight:800}}>搜尋</button>
      </form>

      <div style={{display:"grid",gap:12,marginTop:24}}>
        {reports.length === 0 ? <div style={{padding:24,borderRadius:16,background:"#f7f4ee",color:"#706c67"}}>目前沒有符合條件的報告。</div> : reports.map(report => (
          <a key={report.assessment_id} href={`/admin/reports/${encodeURIComponent(report.assessment_id)}`} style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) auto",gap:14,padding:"16px 18px",border:"1px solid #e2ddd4",borderRadius:16,textDecoration:"none",color:"#17172d",background:"#fff"}}>
            <div style={{minWidth:0}}>
              <div style={{fontSize:13,color:"#7b756e",marginBottom:4}}>{new Date(report.created_at).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}</div>
              <div style={{fontWeight:900,fontSize:18,wordBreak:"break-word"}}>{report.name || "未填姓名"}</div>
              <div style={{marginTop:4,color:"#706c67",fontSize:14,wordBreak:"break-word"}}>{report.assessment_id} · {report.birth_date || "日期未知"} · {report.birth_city || "地點未知"}</div>
            </div>
            <div style={{alignSelf:"center",fontWeight:800}}>查看 →</div>
          </a>
        ))}
      </div>
    </section>
  </main>;
}
