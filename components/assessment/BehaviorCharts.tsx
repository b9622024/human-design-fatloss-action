type Dimension = { id: string; label: string; score: number };

type Assessment = {
  dimensions: Dimension[];
  risk: number;
  behaviorTension: number;
  strongest: Dimension;
  weakest: Dimension;
  derived: {
    executionReadiness: number;
    selfRegulation: number;
    externalSupport: number;
    planFlexBalance: number;
    regulationGap: number;
  };
};

type Props = { assessment: Assessment };

const ink = "#17172d";
const muted = "#706c67";
const grid = "#ded9cf";
const soft = "#f5f1e8";

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle - 90) * Math.PI / 180;
  return [cx + Math.cos(rad) * r, cy + Math.sin(rad) * r] as const;
}

export function BehaviorCharts({ assessment }: Props) {
  const dims = assessment.dimensions;
  const byId = Object.fromEntries(dims.map(d => [d.id, d.score])) as Record<string, number>;
  const ranked = [...dims].sort((a, b) => a.score - b.score);
  const radarCx = 250, radarCy = 245, radarR = 155;
  const radarPoints = dims.map((d, i) => {
    const [x, y] = polar(radarCx, radarCy, radarR * d.score / 100, i * 60);
    return `${x},${y}`;
  }).join(" ");

  const riskItems = [
    ["計畫不足", 100 - (byId.planning ?? 0)],
    ["執行中斷", 100 - (byId.consistency ?? 0)],
    ["恢復困難", 100 - (byId.recovery ?? 0)],
    ["覺察不足", 100 - (byId.awareness ?? 0)],
    ["情緒干擾", 100 - (byId.emotion ?? 0)],
    ["環境阻力", 100 - (byId.environment ?? 0)],
  ] as const;

  const tensionPairs = [
    ["計畫 vs 彈性", byId.planning ?? 0, byId.recovery ?? 0],
    ["覺察 vs 情緒", byId.awareness ?? 0, byId.emotion ?? 0],
    ["執行 vs 環境", byId.consistency ?? 0, byId.environment ?? 0],
  ] as const;

  return (
    <svg id="behavior-report-svg" viewBox="0 0 1200 2100" width="100%" role="img" aria-label="五張行為分析圖">
      <rect width="1200" height="2100" fill="#ffffff" rx="28" />
      <text x="70" y="80" fontSize="34" fontWeight="800" fill={ink}>減脂行為分析</text>
      <text x="70" y="120" fontSize="18" fill={muted}>18 題測驗 · 五張分析圖</text>

      <g transform="translate(60 165)">
        <rect width="520" height="500" rx="24" fill={soft} />
        <text x="28" y="46" fontSize="24" fontWeight="800" fill={ink}>① 六大行為輪廓</text>
        {[0.25,0.5,0.75,1].map((level) => {
          const pts = dims.map((_, i) => polar(radarCx, radarCy, radarR * level, i * 60).join(",")).join(" ");
          return <polygon key={level} points={pts} fill="none" stroke={grid} strokeWidth="1.5" />;
        })}
        {dims.map((d, i) => {
          const [x1,y1] = polar(radarCx, radarCy, radarR, i * 60);
          const [lx,ly] = polar(radarCx, radarCy, radarR + 34, i * 60);
          return <g key={d.id}><line x1={radarCx} y1={radarCy} x2={x1} y2={y1} stroke={grid} /><text x={lx} y={ly} textAnchor="middle" fontSize="15" fill={ink}>{d.label}</text></g>;
        })}
        <polygon points={radarPoints} fill="rgba(23,23,45,0.12)" stroke={ink} strokeWidth="4" />
        {dims.map((d,i) => { const [x,y] = polar(radarCx, radarCy, radarR * d.score / 100, i * 60); return <g key={d.id}><circle cx={x} cy={y} r="6" fill={ink}/><text x={x} y={y-12} textAnchor="middle" fontSize="14" fontWeight="700" fill={ink}>{d.score}</text></g>; })}
      </g>

      <g transform="translate(620 165)">
        <rect width="520" height="500" rx="24" fill={soft} />
        <text x="28" y="46" fontSize="24" fontWeight="800" fill={ink}>② 執行模式四象限</text>
        <line x1="70" y1="420" x2="460" y2="420" stroke={ink} strokeWidth="2" />
        <line x1="70" y1="420" x2="70" y2="90" stroke={ink} strokeWidth="2" />
        <line x1="265" y1="90" x2="265" y2="420" stroke={grid} strokeDasharray="8 8" />
        <line x1="70" y1="255" x2="460" y2="255" stroke={grid} strokeDasharray="8 8" />
        <text x="72" y="447" fontSize="15" fill={muted}>較重視計畫</text><text x="365" y="447" fontSize="15" fill={muted}>較重視彈性</text>
        <text x="12" y="110" fontSize="15" fill={muted}>高執行</text><text x="12" y="416" fontSize="15" fill={muted}>低執行</text>
        {(() => {
          const x = 70 + ((byId.recovery ?? 50) / 100) * 390;
          const y = 420 - (assessment.derived.executionReadiness / 100) * 330;
          return <g><circle cx={x} cy={y} r="18" fill={ink}/><text x={x} y={y+5} textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">你</text><text x="265" y="486" textAnchor="middle" fontSize="16" fill={ink}>執行準備度 {assessment.derived.executionReadiness} · 彈性 {byId.recovery ?? 0}</text></g>;
        })()}
      </g>

      <g transform="translate(60 705)">
        <rect width="1080" height="390" rx="24" fill={soft} />
        <text x="28" y="46" fontSize="24" fontWeight="800" fill={ink}>③ 減脂阻力風險</text>
        {riskItems.map(([label,value], i) => {
          const y = 88 + i * 47;
          const w = Math.max(4, value * 7.2);
          return <g key={label}><text x="28" y={y+16} fontSize="16" fill={ink}>{label}</text><rect x="170" y={y} width="720" height="22" rx="11" fill="#e8e3db"/><rect x="170" y={y} width={w} height="22" rx="11" fill={ink}/><text x="920" y={y+17} fontSize="16" fontWeight="700" fill={ink}>{Math.round(value)}</text></g>;
        })}
        <text x="28" y="365" fontSize="15" fill={muted}>整體 Risk：{assessment.risk}。分數越高代表目前越容易形成減脂阻力。</text>
      </g>

      <g transform="translate(60 1135)">
        <rect width="1080" height="360" rx="24" fill={soft} />
        <text x="28" y="46" fontSize="24" fontWeight="800" fill={ink}>④ Behavior Tension 張力圖</text>
        {tensionPairs.map(([label,a,b], i) => {
          const y = 100 + i * 82;
          const x1 = 235 + a * 6.9;
          const x2 = 235 + b * 6.9;
          return <g key={label}><text x="28" y={y+6} fontSize="16" fill={ink}>{label}</text><line x1="235" y1={y} x2="925" y2={y} stroke={grid} strokeWidth="4"/><line x1={Math.min(x1,x2)} y1={y} x2={Math.max(x1,x2)} y2={y} stroke={ink} strokeWidth="5"/><circle cx={x1} cy={y} r="9" fill="#fff" stroke={ink} strokeWidth="4"/><circle cx={x2} cy={y} r="9" fill={ink}/><text x="955" y={y+6} fontSize="15" fill={muted}>{a} / {b}</text></g>;
        })}
        <text x="28" y="334" fontSize="15" fill={muted}>目前整體張力：{assessment.behaviorTension}。差距越大，代表不同能力之間越容易互相拉扯。</text>
      </g>

      <g transform="translate(60 1535)">
        <rect width="1080" height="500" rx="24" fill={soft} />
        <text x="28" y="46" fontSize="24" fontWeight="800" fill={ink}>⑤ 行動優先順序</text>
        {ranked.slice(0,5).map((d, i) => {
          const priority = 100 - d.score;
          const y = 90 + i * 70;
          return <g key={d.id}><text x="28" y={y+18} fontSize="17" fontWeight={i===0?800:600} fill={ink}>{i+1}. {d.label}</text><rect x="250" y={y} width="650" height="26" rx="13" fill="#e8e3db"/><rect x="250" y={y} width={Math.max(6, priority*6.5)} height="26" rx="13" fill={ink}/><text x="930" y={y+19} fontSize="16" fill={ink}>優先度 {priority}</text></g>;
        })}
        <text x="28" y="458" fontSize="16" fill={muted}>最強項：{assessment.strongest.label} {assessment.strongest.score}　｜　優先改善：{assessment.weakest.label} {assessment.weakest.score}</text>
      </g>
    </svg>
  );
}
