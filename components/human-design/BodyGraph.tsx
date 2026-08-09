"use client";

import type { CenterId, CoreHumanDesignChart } from "@/lib/human-design/topology";

type Props = {
  chart: CoreHumanDesignChart;
  width?: number;
};

type Point = { x: number; y: number };

const CENTER_POINTS: Record<CenterId, Point> = {
  Head: { x: 300, y: 55 },
  Ajna: { x: 300, y: 150 },
  Throat: { x: 300, y: 250 },
  G: { x: 300, y: 370 },
  Ego: { x: 405, y: 390 },
  Spleen: { x: 180, y: 485 },
  "Solar Plexus": { x: 425, y: 505 },
  Sacral: { x: 300, y: 535 },
  Root: { x: 300, y: 675 },
};

const CHANNEL_CENTERS: Record<string, [CenterId, CenterId]> = {
  "47-64": ["Head", "Ajna"], "24-61": ["Head", "Ajna"], "4-63": ["Head", "Ajna"],
  "17-62": ["Ajna", "Throat"], "23-43": ["Ajna", "Throat"], "11-56": ["Ajna", "Throat"],
  "16-48": ["Throat", "Spleen"], "20-57": ["Throat", "Spleen"], "10-20": ["Throat", "G"],
  "20-34": ["Throat", "Sacral"], "12-22": ["Throat", "Solar Plexus"], "35-36": ["Throat", "Solar Plexus"],
  "21-45": ["Throat", "Ego"], "7-31": ["Throat", "G"], "13-33": ["Throat", "G"], "1-8": ["Throat", "G"],
  "2-14": ["G", "Sacral"], "5-15": ["G", "Sacral"], "29-46": ["G", "Sacral"], "10-34": ["G", "Sacral"],
  "34-57": ["Sacral", "Spleen"], "27-50": ["Sacral", "Spleen"], "32-54": ["Spleen", "Root"],
  "18-58": ["Spleen", "Root"], "28-38": ["Spleen", "Root"], "3-60": ["Sacral", "Root"],
  "9-52": ["Sacral", "Root"], "42-53": ["Sacral", "Root"], "19-49": ["Root", "Solar Plexus"],
  "39-55": ["Root", "Solar Plexus"], "30-41": ["Root", "Solar Plexus"], "25-51": ["G", "Ego"],
  "26-44": ["Ego", "Spleen"], "37-40": ["Ego", "Solar Plexus"], "10-57": ["G", "Spleen"],
  "6-59": ["Sacral", "Solar Plexus"],
};

function centerShape(center: CenterId, defined: boolean) {
  const p = CENTER_POINTS[center];
  const fill = defined ? "#ead7a7" : "#ffffff";
  const stroke = defined ? "#17172d" : "#a9a6a0";
  const common = { fill, stroke, strokeWidth: 3 };

  if (center === "Head") return <polygon points={`${p.x},${p.y - 35} ${p.x - 46},${p.y + 30} ${p.x + 46},${p.y + 30}`} {...common} />;
  if (center === "Ajna") return <polygon points={`${p.x - 46},${p.y - 30} ${p.x + 46},${p.y - 30} ${p.x},${p.y + 35}`} {...common} />;
  if (center === "G") return <polygon points={`${p.x},${p.y - 45} ${p.x + 45},${p.y} ${p.x},${p.y + 45} ${p.x - 45},${p.y}`} {...common} />;
  if (center === "Ego") return <polygon points={`${p.x - 34},${p.y + 25} ${p.x + 34},${p.y + 25} ${p.x},${p.y - 30}`} {...common} />;
  if (center === "Spleen") return <polygon points={`${p.x - 42},${p.y - 42} ${p.x + 42},${p.y} ${p.x - 42},${p.y + 42}`} {...common} />;
  if (center === "Solar Plexus") return <polygon points={`${p.x + 42},${p.y - 42} ${p.x - 42},${p.y} ${p.x + 42},${p.y + 42}`} {...common} />;
  return <rect x={p.x - 42} y={p.y - 34} width={84} height={68} rx={center === "Throat" ? 4 : 8} {...common} />;
}

export function BodyGraph({ chart, width = 600 }: Props) {
  const defined = new Set(chart.centers);
  const channels = new Set(chart.channels);

  return (
    <svg viewBox="0 0 600 760" width={width} role="img" aria-label="Human Design BodyGraph">
      <rect x="0" y="0" width="600" height="760" rx="28" fill="#fbfaf7" />

      {Object.entries(CHANNEL_CENTERS).map(([id, [a, b]]) => {
        const p1 = CENTER_POINTS[a];
        const p2 = CENTER_POINTS[b];
        const active = channels.has(id);
        return (
          <g key={id}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={active ? "#17172d" : "#d8d4cc"} strokeWidth={active ? 8 : 4} strokeLinecap="round" />
            {active && (
              <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 - 7} textAnchor="middle" fontSize="15" fontWeight="700" fill="#17172d" paintOrder="stroke" stroke="#fbfaf7" strokeWidth="5">
                {id}
              </text>
            )}
          </g>
        );
      })}

      {(Object.keys(CENTER_POINTS) as CenterId[]).map((center) => (
        <g key={center}>
          {centerShape(center, defined.has(center))}
          <text x={CENTER_POINTS[center].x} y={CENTER_POINTS[center].y + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill="#17172d">
            {center === "Solar Plexus" ? "Solar" : center}
          </text>
        </g>
      ))}

      <text x="300" y="735" textAnchor="middle" fontSize="14" fill="#6f6b64">
        {chart.type} · {chart.authority} · {chart.profile} · {chart.definition}
      </text>
    </svg>
  );
}
