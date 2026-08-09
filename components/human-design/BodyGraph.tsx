"use client";

import type { HumanDesignActivation } from "@/lib/human-design/activations";
import { CHANNELS, type CenterId, type CoreHumanDesignChart } from "@/lib/human-design/topology";

type Props = {
  chart: CoreHumanDesignChart;
  personalityActivations?: HumanDesignActivation[];
  designActivations?: HumanDesignActivation[];
  width?: number;
};

type Point = { x: number; y: number };
type GateSource = "personality" | "design" | "both" | "inactive";

const CENTER_POINTS: Record<CenterId, Point> = {
  Head: { x: 450, y: 86 },
  Ajna: { x: 450, y: 190 },
  Throat: { x: 450, y: 310 },
  G: { x: 450, y: 445 },
  Ego: { x: 575, y: 455 },
  Spleen: { x: 305, y: 565 },
  "Solar Plexus": { x: 600, y: 575 },
  Sacral: { x: 450, y: 625 },
  Root: { x: 450, y: 760 },
};

const CENTER_FILL: Record<CenterId, string> = {
  Head: "#f3db64",
  Ajna: "#78b89b",
  Throat: "#a88255",
  G: "#f2d95b",
  Ego: "#d65c62",
  Spleen: "#ad7145",
  "Solar Plexus": "#c68b5a",
  Sacral: "#d25f59",
  Root: "#b67d54",
};

const BODY_SYMBOL: Record<string, string> = {
  Sun: "☉", Earth: "⊕", Moon: "☽", NorthNode: "☊", SouthNode: "☋",
  Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄",
  Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

const GATE_PORTS: Record<number, Point> = {
  64: { x: 420, y: 119 }, 61: { x: 450, y: 122 }, 63: { x: 480, y: 119 },
  47: { x: 420, y: 156 }, 24: { x: 450, y: 154 }, 4: { x: 480, y: 156 },
  17: { x: 420, y: 224 }, 43: { x: 450, y: 228 }, 11: { x: 480, y: 224 },
  62: { x: 420, y: 271 }, 23: { x: 450, y: 271 }, 56: { x: 480, y: 271 },
  16: { x: 400, y: 292 }, 20: { x: 400, y: 320 },
  31: { x: 425, y: 349 }, 8: { x: 450, y: 349 }, 33: { x: 475, y: 349 },
  45: { x: 500, y: 292 }, 12: { x: 500, y: 315 }, 35: { x: 500, y: 338 },
  1: { x: 430, y: 398 }, 7: { x: 450, y: 393 }, 13: { x: 470, y: 398 },
  10: { x: 402, y: 445 }, 25: { x: 500, y: 438 },
  2: { x: 430, y: 492 }, 15: { x: 450, y: 497 }, 46: { x: 470, y: 492 },
  21: { x: 557, y: 424 }, 51: { x: 538, y: 456 }, 26: { x: 556, y: 483 }, 40: { x: 608, y: 477 },
  48: { x: 348, y: 530 }, 57: { x: 350, y: 550 }, 44: { x: 350, y: 570 }, 50: { x: 348, y: 590 },
  32: { x: 314, y: 613 }, 18: { x: 294, y: 606 }, 28: { x: 276, y: 596 },
  36: { x: 557, y: 536 }, 22: { x: 552, y: 555 }, 37: { x: 550, y: 576 }, 6: { x: 552, y: 598 },
  49: { x: 592, y: 620 }, 55: { x: 612, y: 612 }, 30: { x: 630, y: 600 },
  34: { x: 400, y: 596 }, 27: { x: 402, y: 615 }, 59: { x: 402, y: 635 },
  5: { x: 425, y: 586 }, 14: { x: 450, y: 586 }, 29: { x: 475, y: 586 },
  3: { x: 425, y: 664 }, 9: { x: 450, y: 664 }, 42: { x: 475, y: 664 },
  54: { x: 392, y: 725 }, 58: { x: 410, y: 721 }, 38: { x: 428, y: 721 },
  60: { x: 444, y: 721 }, 52: { x: 460, y: 721 }, 53: { x: 476, y: 721 },
  19: { x: 492, y: 725 }, 39: { x: 508, y: 730 }, 41: { x: 520, y: 740 },
};

const ROUTE_WAYPOINTS: Record<string, Point[]> = {
  "16-48": [{ x: 365, y: 380 }, { x: 342, y: 465 }],
  "20-57": [{ x: 360, y: 385 }, { x: 345, y: 485 }],
  "10-20": [{ x: 405, y: 370 }],
  "20-34": [{ x: 375, y: 430 }, { x: 390, y: 525 }],
  "12-22": [{ x: 535, y: 380 }, { x: 555, y: 470 }],
  "35-36": [{ x: 550, y: 390 }, { x: 565, y: 470 }],
  "21-45": [{ x: 535, y: 360 }, { x: 560, y: 405 }],
  "7-31": [{ x: 430, y: 370 }],
  "13-33": [{ x: 470, y: 370 }],
  "1-8": [{ x: 450, y: 373 }],
  "2-14": [{ x: 430, y: 535 }],
  "5-15": [{ x: 438, y: 540 }],
  "29-46": [{ x: 468, y: 540 }],
  "10-34": [{ x: 390, y: 510 }, { x: 400, y: 555 }],
  "34-57": [{ x: 375, y: 585 }],
  "27-50": [{ x: 375, y: 602 }],
  "32-54": [{ x: 330, y: 660 }, { x: 360, y: 700 }],
  "18-58": [{ x: 320, y: 650 }, { x: 370, y: 700 }],
  "28-38": [{ x: 305, y: 640 }, { x: 395, y: 705 }],
  "3-60": [{ x: 430, y: 695 }],
  "9-52": [{ x: 450, y: 695 }],
  "42-53": [{ x: 470, y: 695 }],
  "19-49": [{ x: 535, y: 680 }, { x: 565, y: 645 }],
  "39-55": [{ x: 555, y: 690 }, { x: 590, y: 645 }],
  "30-41": [{ x: 575, y: 695 }, { x: 615, y: 640 }],
  "25-51": [{ x: 520, y: 447 }],
  "26-44": [{ x: 500, y: 520 }, { x: 430, y: 555 }],
  "37-40": [{ x: 585, y: 525 }],
  "10-57": [{ x: 390, y: 500 }, { x: 365, y: 535 }],
  "6-59": [{ x: 505, y: 615 }],
};

function centerShape(center: CenterId, defined: boolean) {
  const p = CENTER_POINTS[center];
  const fill = defined ? CENTER_FILL[center] : "#ffffff";
  const common = { fill, stroke: "#252433", strokeWidth: 2.8 };
  if (center === "Head") return <polygon points={`${p.x},${p.y - 43} ${p.x - 55},${p.y + 36} ${p.x + 55},${p.y + 36}`} {...common} />;
  if (center === "Ajna") return <polygon points={`${p.x - 55},${p.y - 36} ${p.x + 55},${p.y - 36} ${p.x},${p.y + 44}`} {...common} />;
  if (center === "G") return <polygon points={`${p.x},${p.y - 52} ${p.x + 52},${p.y} ${p.x},${p.y + 52} ${p.x - 52},${p.y}`} {...common} />;
  if (center === "Ego") return <polygon points={`${p.x - 40},${p.y + 30} ${p.x + 40},${p.y + 30} ${p.x},${p.y - 35}`} {...common} />;
  if (center === "Spleen") return <polygon points={`${p.x - 50},${p.y - 50} ${p.x + 50},${p.y} ${p.x - 50},${p.y + 50}`} {...common} />;
  if (center === "Solar Plexus") return <polygon points={`${p.x + 50},${p.y - 50} ${p.x - 50},${p.y} ${p.x + 50},${p.y + 50}`} {...common} />;
  return <rect x={p.x - 50} y={p.y - 39} width={100} height={78} rx={center === "Throat" ? 5 : 9} {...common} />;
}

function canonicalChannelId(gateA: number, gateB: number) {
  return `${Math.min(gateA, gateB)}-${Math.max(gateA, gateB)}`;
}

function sourceForGate(gate: number, personality: Set<number>, design: Set<number>): GateSource {
  const p = personality.has(gate);
  const d = design.has(gate);
  if (p && d) return "both";
  if (p) return "personality";
  if (d) return "design";
  return "inactive";
}

function sourceColors(source: GateSource) {
  if (source === "personality") return ["#24212d"];
  if (source === "design") return ["#d94a43"];
  if (source === "both") return ["#24212d", "#d94a43"];
  return [];
}

function distance(a: Point, b: Point) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function pointAtFraction(points: Point[], fraction: number) {
  const total = points.slice(1).reduce((sum, p, i) => sum + distance(points[i], p), 0);
  const target = total * fraction;
  let walked = 0;
  for (let i = 1; i < points.length; i++) {
    const seg = distance(points[i - 1], points[i]);
    if (walked + seg >= target) {
      const t = seg === 0 ? 0 : (target - walked) / seg;
      return { x: points[i - 1].x + (points[i].x - points[i - 1].x) * t, y: points[i - 1].y + (points[i].y - points[i - 1].y) * t };
    }
    walked += seg;
  }
  return points[points.length - 1];
}

function trimToFraction(points: Point[], fraction: number) {
  if (fraction <= 0) return [points[0]];
  if (fraction >= 1) return points;
  const total = points.slice(1).reduce((sum, p, i) => sum + distance(points[i], p), 0);
  const target = total * fraction;
  const out: Point[] = [points[0]];
  let walked = 0;
  for (let i = 1; i < points.length; i++) {
    const seg = distance(points[i - 1], points[i]);
    if (walked + seg < target) {
      out.push(points[i]);
      walked += seg;
      continue;
    }
    const t = seg === 0 ? 0 : (target - walked) / seg;
    out.push({ x: points[i - 1].x + (points[i].x - points[i - 1].x) * t, y: points[i - 1].y + (points[i].y - points[i - 1].y) * t });
    break;
  }
  return out;
}

function splitAtHalf(points: Point[]) {
  const mid = pointAtFraction(points, 0.5);
  const left = trimToFraction(points, 0.5);
  const reversed = [...points].reverse();
  const right = trimToFraction(reversed, 0.5);
  left[left.length - 1] = mid;
  right[right.length - 1] = mid;
  return { left, right };
}

function pointsString(points: Point[]) {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

function ColoredPolyline({ points, source, width = 7 }: { points: Point[]; source: GateSource; width?: number }) {
  const colors = sourceColors(source);
  if (!colors.length) return null;
  if (colors.length === 1) return <polyline points={pointsString(points)} fill="none" stroke={colors[0]} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />;
  return (
    <g>
      <polyline points={pointsString(points)} fill="none" stroke={colors[0]} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pointsString(points)} fill="none" stroke={colors[1]} strokeWidth={Math.max(3, width / 2)} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function gateTextColor(source: GateSource) {
  if (source === "design") return "#d94a43";
  if (source === "personality") return "#24212d";
  if (source === "both") return "#7f2d37";
  return "#817d77";
}

function ActivationPanel({ x, title, color, activations, align }: { x: number; title: string; color: string; activations: HumanDesignActivation[]; align: "left" | "right" }) {
  const rowH = 32;
  const startY = 95;
  return (
    <g>
      <text x={x} y="55" textAnchor={align === "left" ? "start" : "end"} fontSize="18" fontWeight="800" fill={color}>{title}</text>
      {activations.map((a, i) => {
        const y = startY + i * rowH;
        return (
          <g key={`${title}-${a.body}`}>
            <text x={x} y={y} textAnchor={align === "left" ? "start" : "end"} fontSize="20" fontWeight="700" fill={color}>{BODY_SYMBOL[a.body] ?? "•"}</text>
            <text x={x + (align === "left" ? 28 : -28)} y={y} textAnchor={align === "left" ? "start" : "end"} fontSize="15" fontWeight="700" fill="#252433">{a.gate}.{a.line}</text>
          </g>
        );
      })}
    </g>
  );
}

export function BodyGraph({ chart, personalityActivations = [], designActivations = [], width = 900 }: Props) {
  const defined = new Set(chart.centers);
  const activeChannels = new Set(chart.channels);
  const personalityGates = new Set(personalityActivations.map((a) => a.gate));
  const designGates = new Set(designActivations.map((a) => a.gate));
  const gateSources = new Map<number, GateSource>();
  Object.keys(GATE_PORTS).forEach((g) => gateSources.set(Number(g), sourceForGate(Number(g), personalityGates, designGates)));

  return (
    <svg viewBox="0 0 900 850" width={width} role="img" aria-label="Human Design BodyGraph">
      <rect x="0" y="0" width="900" height="850" rx="28" fill="#fbfaf7" />
      <ActivationPanel x={38} title="Design" color="#d94a43" activations={designActivations} align="left" />
      <ActivationPanel x={862} title="Personality" color="#24212d" activations={personalityActivations} align="right" />

      <g>
        {CHANNELS.map((channel) => {
          const id = canonicalChannelId(channel.gateA, channel.gateB);
          const a = GATE_PORTS[channel.gateA] ?? CENTER_POINTS[channel.centerA];
          const b = GATE_PORTS[channel.gateB] ?? CENTER_POINTS[channel.centerB];
          const path = [a, ...(ROUTE_WAYPOINTS[id] ?? []), b];
          const { left, right } = splitAtHalf(path);
          const complete = activeChannels.has(id);
          const sourceA = sourceForGate(channel.gateA, personalityGates, designGates);
          const sourceB = sourceForGate(channel.gateB, personalityGates, designGates);
          const leftActive = complete ? left : trimToFraction(left, 0.74);
          const rightActive = complete ? right : trimToFraction(right, 0.74);
          return (
            <g key={id}>
              <polyline points={pointsString(path)} fill="none" stroke="#dedbd5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {sourceA !== "inactive" && <ColoredPolyline points={leftActive} source={sourceA} />}
              {sourceB !== "inactive" && <ColoredPolyline points={rightActive} source={sourceB} />}
            </g>
          );
        })}
      </g>

      {(Object.keys(CENTER_POINTS) as CenterId[]).map((center) => (
        <g key={center}>
          {centerShape(center, defined.has(center))}
          <text x={CENTER_POINTS[center].x} y={CENTER_POINTS[center].y + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill="#252433">
            {center === "Solar Plexus" ? "Solar" : center}
          </text>
        </g>
      ))}

      <g>
        {Object.entries(GATE_PORTS).map(([gateString, port]) => {
          const gate = Number(gateString);
          const source = gateSources.get(gate) ?? "inactive";
          return (
            <g key={`gate-${gate}`}>
              <circle cx={port.x} cy={port.y} r="8.5" fill="#fbfaf7" opacity="0.96" />
              <text x={port.x} y={port.y + 3.4} textAnchor="middle" fontSize="9.5" fontWeight="900" fill={gateTextColor(source)}>{gate}</text>
            </g>
          );
        })}
      </g>

      <g transform="translate(450 822)">
        <rect x="-245" y="-24" width="490" height="34" rx="17" fill="#ffffff" stroke="#e3dfd7" />
        <text x="0" y="-2" textAnchor="middle" fontSize="14" fontWeight="700" fill="#5f5a54">
          {chart.type} · {chart.authority} · {chart.profile} · {chart.definition}
        </text>
      </g>
    </svg>
  );
}
