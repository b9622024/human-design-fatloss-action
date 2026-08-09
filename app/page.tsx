export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="eyebrow">可樂吉健康研究所</div>
        <div className="status">DEVELOPMENT · v0.2</div>
        <h1>人類圖減脂<br />行動測驗</h1>
        <p className="lead">
          Human Design × 行為測驗，整理你的決策節奏、執行偏好與適合的行動方式。
        </p>
        <div className="notice">
          <strong>BodyGraph 已接入正式流程骨架</strong>
          <span>目前可先建立人類圖，下一階段接上 8 題行為測驗與減脂行動建議。</span>
        </div>
        <a
          href="/assessment"
          style={{
            display: "inline-block",
            marginTop: 22,
            padding: "15px 24px",
            borderRadius: 999,
            background: "#17172d",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 800,
          }}
        >
          開始測驗
        </a>
      </section>

      <section className="grid">
        <article className="card">
          <span className="step">01</span>
          <h2>出生資料</h2>
          <p>出生日期、時間、地點與時區正規化。</p>
        </article>
        <article className="card">
          <span className="step">02</span>
          <h2>Human Design</h2>
          <p>Personality、Design Moment、Gate、Line、Channel 與 Center。</p>
        </article>
        <article className="card">
          <span className="step">03</span>
          <h2>行為分析</h2>
          <p>8 題行為測驗、六大維度、Risk 與 Behavior Tension。</p>
        </article>
        <article className="card">
          <span className="step">04</span>
          <h2>教練報告</h2>
          <p>Cross Analysis、完整 JSON、BodyGraph 與單張 PNG 報告。</p>
        </article>
      </section>

      <p className="footer-note">目前為開發測試流程，正式報告內容尚未開放。</p>
    </main>
  );
}
