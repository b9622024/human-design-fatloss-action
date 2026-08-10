import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/server/admin-auth";

const shell = { minHeight: "100vh", background: "#f5f1e8", padding: "32px 16px" } as const;
const card = { maxWidth: 720, margin: "0 auto", background: "white", border: "1px solid #ded9cf", borderRadius: 28, padding: "clamp(24px,6vw,44px)" } as const;

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  if (await isAdminAuthenticated()) redirect("/admin/reports/list");

  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : "";

  return <main style={shell}><section style={card}>
    <div style={{fontSize:13,fontWeight:800,opacity:.6}}>可樂吉健康研究所 · ADMIN</div>
    <h1 style={{fontSize:"clamp(32px,8vw,52px)",margin:"14px 0",color:"#17172d"}}>報告後台</h1>
    <p style={{color:"#706c67",lineHeight:1.7}}>此頁僅供管理者使用。請輸入後台密碼。</p>
    {error === "1" && <p style={{color:"#9f2e25",fontWeight:700}}>密碼不正確，請再試一次。</p>}
    <form method="POST" action="/admin/reports/login" style={{display:"grid",gap:12,marginTop:24}}>
      <input name="password" type="password" required placeholder="後台密碼" autoComplete="current-password" style={{padding:15,border:"1px solid #d9d4ca",borderRadius:14,fontSize:16,width:"100%",boxSizing:"border-box"}} />
      <button style={{padding:16,border:0,borderRadius:999,background:"#17172d",color:"white",fontSize:16,fontWeight:800}}>進入後台</button>
    </form>
  </section></main>;
}
