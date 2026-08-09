# 人類圖減脂行動測驗

正式 GitHub + Vercel 開發版本。

## 目前階段

v0.1 建立 Next.js + TypeScript 可部署骨架。

下一階段將依 `hd-self-calculation-engine-1.0.0` 規格實作自建 Human Design Calculation Engine。Human Design 計算不得由 AI 猜測，正式環境不得 fallback 到 Mock chart。

## Planned architecture

Birth Data → Timezone Normalization → Ephemeris → Personality Activations → 88° Design Moment → Design Activations → Gate/Line → Channels → Centers → Type/Strategy/Authority/Profile/Definition → Validation → Behavior Engine → Cross Analysis → Coach Report → BodyGraph/Charts → PNG Renderer

## Secrets

`HDHUB_API_KEY` 僅供 reference validation 使用，必須設定於 Vercel server-side Environment Variables，不得提交到 GitHub。
