export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="eyebrow">可樂吉健康研究所</div>
        <div className="status">DEVELOPMENT · v0.1</div>
        <h1>人類圖減脂<br />行動測驗</h1>
        <p className="lead">
          Human Design × 行為測驗，整理你的決策節奏、執行偏好與適合的行動方式。
        </p>
        <div className="notice">
          <strong>開發環境已建立</strong>
          <span>下一階段將接入自建 Human Design Calculation Engine。</span>
        </div>
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

      <p className="footer-note">目前僅為部署驗證頁，不產生正式 Human Design 結果。</p>
    </main>
  );
}
