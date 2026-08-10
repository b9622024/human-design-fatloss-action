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
const brand = "#a97540";

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle - 90) * Math.PI / 180;
  return [cx + Math.cos(rad) * r, cy + Math.sin(rad) * r] as const;
}

export function BehaviorCharts({ assessment }: Props) {
  const dims = assessment.dimensions;
  const byId = Object.fromEntries(dims.map(d => [d.id, d.score])) as Record<string, number>;
  const ranked = [...dims].sort((a, b) => a.score - b.score);

  const radarCx = 185, radarCy = 190, radarR = 120;
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
    <svg id="behavior-report-svg" viewBox="0 0 1600 900" width="100%" role="img" aria-label="減脂行為分析 16 比 9 報告">
      <rect width="1600" height="900" fill="#fbfaf7" rx="32" />

      <text x="60" y="58" fontSize="26" fontWeight="800" fill={brand}>可樂吉健康研究所</text>
      <text x="60" y="100" fontSize="34" fontWeight="800" fill={ink}>減脂行為分析</text>
      <text x="60" y="132" fontSize="17" fill={muted}>18 題測驗 · 五張分析圖</text>

      <g transform="translate(50 165)">
        <rect width="430" height="330" rx="24" fill={soft} />
        <text x="24" y="40" fontSize="22" fontWeight="800" fill={ink}>① 六大行為輪廓</text>
        {[0.25,0.5,0.75,1].map(level => {
          const pts = dims.map((_, i) => polar(radarCx, radarCy, radarR * level, i * 60).join(",")).join(" ");
          return <polygon key={level} points={pts} fill="none" stroke={grid} strokeWidth="1.2" />;
        })}
        {dims.map((d, i) => {
          const [x1,y1] = polar(radarCx, radarCy, radarR, i * 60);
          const [lx,ly] = polar(radarCx, radarCy, radarR + 26, i * 60);
          return <g key={d.id}><line x1={radarCx} y1={radarCy} x2={x1} y2={y1} stroke={grid} /><text x={lx} y={ly} textAnchor="middle" fontSize="12" fill={ink}>{d.label}</text></g>;
        })}
        <polygon points={radarPoints} fill="rgba(23,23,45,0.12)" stroke={ink} strokeWidth="3" />
        {dims.map((d,i) => { const [x,y] = polar(radarCx, radarCy, radarR * d.score / 100, i * 60); return <g key={d.id}><circle cx={x} cy={y} r="5" fill={ink}/><text x={x} y={y-9} textAnchor="middle" fontSize="12" fontWeight="700" fill={ink}>{d.score}</text></g>; })}
      </g>

      <g transform="translate(500 165)">
        <rect width="430" height="330" rx="24" fill={soft} />
        <text x="24" y="40" fontSize="22" fontWeight="800" fill={ink}>② 執行模式四象限</text>
        <line x1="70" y1="275" x2="380" y2="275" stroke={ink} strokeWidth="2" />
        <line x1="70" y1="275" x2="70" y2="75" stroke={ink} strokeWidth="2" />
        <line x1="225" y1="75" x2="225" y2="275" stroke={grid} strokeDasharray="7 7" />
        <line x1="70" y1="175" x2="380" y2="175" stroke={grid} strokeDasharray="7 7" />
        <text x="72" y="302" fontSize="12" fill={muted}>較重視計畫</text><text x="300" y="302" fontSize="12" fill={muted}>較重視彈性</text>
        <text x="18" y="88" fontSize="12" fill={muted}>高執行</text><text x="18" y="274" fontSize="12" fill={muted}>低執行</text>
        {(() => {
          const x = 70 + ((byId.recovery ?? 50) / 100) * 310;
          const y = 275 - (assessment.derived.executionReadiness / 100) * 200;
          return <g><circle cx={x} cy={y} r="17" fill={ink}/><text x={x} y={y+5} textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff">你</text></g>;
        })()}
      </g>

      <g transform="translate(950 165)">
        <rect width="600" height="330" rx="24" fill={soft} />
        <text x="24" y="40" fontSize="22" fontWeight="800" fill={ink}>③ 減脂阻力風險</text>
        {riskItems.map(([label,value], i) => {
          const y = 70 + i * 38;
          return <g key={label}><text x="24" y={y+14} fontSize="14" fill={ink}>{label}</text><rect x="120" y={y} width="390" height="18" rx="9" fill="#e8e3db"/><rect x="120" y={y} width={Math.max(4, value * 3.9)} height="18" rx="9" fill={ink}/><text x="530" y={y+14} fontSize="14" fontWeight="700" fill={ink}>{Math.round(value)}</text></g>;
        })}
        <text x="24" y="310" fontSize="13" fill={muted}>整體 Risk：{assessment.risk}</text>
      </g>

      <g transform="translate(50 525)">
        <rect width="720" height="310" rx="24" fill={soft} />
        <text x="24" y="40" fontSize="22" fontWeight="800" fill={ink}>④ Behavior Tension 張力圖</text>
        {tensionPairs.map(([label,a,b], i) => {
          const y = 92 + i * 64;
          const x1 = 205 + a * 4.1;
          const x2 = 205 + b * 4.1;
          return <g key={label}><text x="24" y={y+5} fontSize="14" fill={ink}>{label}</text><line x1="205" y1={y} x2="615" y2={y} stroke={grid} strokeWidth="4"/><line x1={Math.min(x1,x2)} y1={y} x2={Math.max(x1,x2)} y2={y} stroke={ink} strokeWidth="5"/><circle cx={x1} cy={y} r="8" fill="#fff" stroke={ink} strokeWidth="3"/><circle cx={x2} cy={y} r="8" fill={ink}/><text x="635" y={y+5} fontSize="13" fill={muted}>{a} / {b}</text></g>;
        })}
        <text x="24" y="286" fontSize="13" fill={muted}>整體張力：{assessment.behaviorTension}</text>
      </g>

      <g transform="translate(800 525)">
        <rect width="750" height="310" rx="24" fill={soft} />
        <text x="24" y="40" fontSize="22" fontWeight="800" fill={ink}>⑤ 行動優先順序</text>
        {ranked.slice(0,5).map((d, i) => {
          const priority = 100 - d.score;
          const y = 66 + i * 43;
          return <g key={d.id}><text x="24" y={y+14} fontSize="14" fontWeight={i===0?800:600} fill={ink}>{i+1}. {d.label}</text><rect x="220" y={y} width="400" height="18" rx="9" fill="#e8e3db"/><rect x="220" y={y} width={Math.max(4, priority*4)} height="18" rx="9" fill={ink}/><text x="640" y={y+14} fontSize="13" fill={ink}>優先度 {priority}</text></g>;
        })}
        <text x="24" y="287" fontSize="13" fill={muted}>最強：{assessment.strongest.label} {assessment.strongest.score}　｜　優先改善：{assessment.weakest.label} {assessment.weakest.score}</text>
      </g>

      <text x="1540" y="870" textAnchor="end" fontSize="13" fill={muted}>Human Design × Fat Loss Action Report</text>
    </svg>
  );
}
