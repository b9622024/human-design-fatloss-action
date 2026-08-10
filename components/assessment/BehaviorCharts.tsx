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

type Props = {
  assessment: Assessment;
  name?: string;
  birthDate?: string;
  birthTime?: string | null;
  birthCity?: string;
};

const ink = "#17172d";
const muted = "#706c67";
const grid = "#ded9cf";
const soft = "#f7f4ee";
const brand = "#d2a55c";
const accent = "#8d6bd8";

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle - 90) * Math.PI / 180;
  return [cx + Math.cos(rad) * r, cy + Math.sin(rad) * r] as const;
}

function prefPosition(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function BehaviorCharts({ assessment, name = "未填寫", birthDate = "", birthTime = null, birthCity = "" }: Props) {
  const dims = assessment.dimensions;
  const byId = Object.fromEntries(dims.map(d => [d.id, d.score])) as Record<string, number>;
  const ranked = [...dims].sort((a, b) => a.score - b.score);

  const radarCx = 225, radarCy = 195, radarR = 125;
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

  const planPreference = prefPosition(50 + assessment.derived.planFlexBalance / 2);
  const supportPreference = prefPosition(assessment.derived.externalSupport);
  const rhythmPreference = prefPosition(50 + ((byId.recovery ?? 50) - (byId.consistency ?? 50)) / 2);

  const preferences = [
    ["計畫方式", "自由彈性", "明確規則", planPreference],
    ["支援方式", "獨立執行", "環境支持", supportPreference],
    ["執行節奏", "穩定重複", "彈性恢復", rhythmPreference],
  ] as const;

  return (
    <svg id="behavior-report-svg" viewBox="0 0 900 1600" width="100%" role="img" aria-label="減脂行為分析 9 比 16 報告">
      <rect width="900" height="1600" fill="#f7f3ea" />

      <g transform="translate(32 28)">
        <rect width="836" height="200" rx="28" fill={ink} />
        <text x="30" y="42" fontSize="15" fontWeight="800" fill={brand}>可樂吉健康研究所</text>
        <text x="30" y="86" fontSize="32" fontWeight="800" fill="#fff">人類圖減脂行動報告</text>
        <text x="30" y="114" fontSize="15" fill="#d8d7e0">Human Design × 行為問卷</text>
        <line x1="30" y1="130" x2="806" y2="130" stroke="#45445b" />
        <text x="30" y="154" fontSize="11" fill="#9998aa">姓名</text><text x="30" y="178" fontSize="15" fill="#fff">{name || "未填寫"}</text>
        <text x="220" y="154" fontSize="11" fill="#9998aa">出生日期</text><text x="220" y="178" fontSize="15" fill="#fff">{birthDate || "—"}</text>
        <text x="420" y="154" fontSize="11" fill="#9998aa">出生時間</text><text x="420" y="178" fontSize="15" fill="#fff">{birthTime || "未知"}</text>
        <text x="620" y="154" fontSize="11" fill="#9998aa">出生地</text><text x="620" y="178" fontSize="15" fill="#fff">{birthCity || "—"}</text>
      </g>

      <g transform="translate(32 250)">
        <rect width="836" height="350" rx="24" fill="#fff" stroke="#e0dcd4" />
        <text x="24" y="42" fontSize="23" fontWeight="800" fill={ink}>01 六大行為輪廓</text>
        {[0.25,0.5,0.75,1].map(level => {
          const pts = dims.map((_, i) => polar(radarCx, radarCy, radarR * level, i * 60).join(",")).join(" ");
          return <polygon key={level} points={pts} fill="none" stroke={grid} strokeWidth="1.2" />;
        })}
        {dims.map((d, i) => {
          const [x1,y1] = polar(radarCx, radarCy, radarR, i * 60);
          const [lx,ly] = polar(radarCx, radarCy, radarR + 27, i * 60);
          return <g key={d.id}><line x1={radarCx} y1={radarCy} x2={x1} y2={y1} stroke={grid} /><text x={lx} y={ly} textAnchor="middle" fontSize="11" fill={ink}>{d.label}</text></g>;
        })}
        <polygon points={radarPoints} fill="rgba(141,107,216,0.18)" stroke={accent} strokeWidth="3" />
        {dims.map((d,i) => { const [x,y] = polar(radarCx, radarCy, radarR * d.score / 100, i * 60); return <g key={d.id}><circle cx={x} cy={y} r="5" fill={accent}/><text x={x} y={y-9} textAnchor="middle" fontSize="11" fontWeight="700" fill={ink}>{d.score}</text></g>; })}
        <g transform="translate(490 92)">
          {dims.map((d,i) => <g key={d.id} transform={`translate(0 ${i*38})`}><text x="0" y="14" fontSize="13" fill={ink}>{d.label}</text><rect x="145" y="2" width="150" height="14" rx="7" fill="#ece9f0"/><rect x="145" y="2" width={d.score*1.5} height="14" rx="7" fill={accent}/><text x="315" y="14" fontSize="13" fontWeight="700" fill={ink}>{d.score}</text></g>)}
        </g>
      </g>

      <g transform="translate(32 620)">
        <rect width="836" height="250" rx="24" fill="#fff" stroke="#e0dcd4" />
        <text x="24" y="42" fontSize="23" fontWeight="800" fill={ink}>02 執行偏好</text>
        <text x="24" y="68" fontSize="12" fill={muted}>位置代表傾向，不代表能力高低。</text>
        {preferences.map(([label,left,right,value], i) => {
          const y = 105 + i * 58;
          const x = 175 + (value / 100) * 500;
          return <g key={label}><text x="24" y={y+4} fontSize="13" fontWeight="700" fill={ink}>{label}</text><text x="175" y={y-12} fontSize="11" fill={muted}>{left}</text><text x="675" y={y-12} textAnchor="end" fontSize="11" fill={muted}>{right}</text><line x1="175" y1={y} x2="675" y2={y} stroke="#d7d2ca" strokeWidth="7" strokeLinecap="round"/><circle cx={x} cy={y} r="10" fill={accent} stroke="#fff" strokeWidth="3"/><text x="705" y={y+4} fontSize="12" fill={ink}>{Math.round(value)}</text></g>;
        })}
      </g>

      <g transform="translate(32 890)">
        <rect width="836" height="290" rx="24" fill="#fff" stroke="#e0dcd4" />
        <text x="24" y="42" fontSize="23" fontWeight="800" fill={ink}>03 減脂阻力風險</text>
        {riskItems.map(([label,value], i) => {
          const y = 67 + i * 34;
          return <g key={label}><text x="24" y={y+12} fontSize="12" fill={ink}>{label}</text><rect x="125" y={y} width="580" height="16" rx="8" fill="#ece9e3"/><rect x="125" y={y} width={Math.max(4, value * 5.8)} height="16" rx="8" fill={value >= 60 ? "#d77a67" : accent}/><text x="730" y={y+12} fontSize="12" fontWeight="700" fill={ink}>{Math.round(value)}</text></g>;
        })}
        <text x="24" y="270" fontSize="12" fill={muted}>整體 Risk：{assessment.risk}。分數越高，代表目前越容易形成減脂阻力。</text>
      </g>

      <g transform="translate(32 1200)">
        <rect width="836" height="330" rx="24" fill="#fff" stroke="#e0dcd4" />
        <text x="24" y="42" fontSize="23" fontWeight="800" fill={ink}>04 行動優先順序</text>
        {ranked.slice(0,5).map((d, i) => {
          const priority = 100 - d.score;
          const y = 68 + i * 45;
          return <g key={d.id}><text x="24" y={y+14} fontSize="12" fontWeight={i===0?800:600} fill={ink}>{i+1}. {d.label}</text><rect x="210" y={y} width="480" height="17" rx="8.5" fill="#ece9e3"/><rect x="210" y={y} width={Math.max(5, priority*4.8)} height="17" rx="8.5" fill={accent}/><text x="715" y={y+13} fontSize="12" fill={ink}>優先度 {priority}</text></g>;
        })}
        <text x="24" y="305" fontSize="12" fill={muted}>最強：{assessment.strongest.label} {assessment.strongest.score}　｜　優先改善：{assessment.weakest.label} {assessment.weakest.score}</text>
      </g>

      <text x="450" y="1574" textAnchor="middle" fontSize="11" fill="#8b877f">本報告為自我探索工具，不屬醫療、心理或營養診斷。</text>
    </svg>
  );
}
