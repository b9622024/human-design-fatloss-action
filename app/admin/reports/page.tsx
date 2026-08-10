import { redirect } from "next/navigation";

const shell = { minHeight: "100vh", background: "#f5f1e8", padding: "32px 16px" } as const;
const card = { maxWidth: 720, margin: "0 auto", background: "white", border: "1px solid #ded9cf", borderRadius: 28, padding: "clamp(24px,6vw,44px)" } as const;

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  const params = await searchParams;
  const key = typeof params.key === "string" ? params.key : "";
  const configured = process.env.ADMIN_REPORTS_KEY || "";

  if (!configured || key !== configured) {
    return <main style={shell}><section style={card}>
      <div style={{fontSize:13,fontWeight:800,opacity:.6}}>可樂吉健康研究所 · ADMIN</div>
      <h1 style={{fontSize:"clamp(32px,8vw,52px)",margin:"14px 0",color:"#17172d"}}>報告後台</h1>
      <p style={{color:"#706c67",lineHeight:1.7}}>此頁僅供管理者使用。請輸入後台存取碼。</p>
      <form method="GET" style={{display:"grid",gap:12,marginTop:24}}>
        <input name="key" type="password" required placeholder="後台存取碼" style={{padding:15,border:"1px solid #d9d4ca",borderRadius:14,fontSize:16,width:"100%",boxSizing:"border-box"}} />
        <button style={{padding:16,border:0,borderRadius:999,background:"#17172d",color:"white",fontSize:16,fontWeight:800}}>進入後台</button>
      </form>
    </section></main>;
  }

  redirect(`/admin/reports/list?key=${encodeURIComponent(key)}`);
}
