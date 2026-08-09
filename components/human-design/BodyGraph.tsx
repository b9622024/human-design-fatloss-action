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
  Head: { x: 450, y: 82 },
  Ajna: { x: 450, y: 188 },
  Throat: { x: 450, y: 310 },
  G: { x: 450, y: 438 },
  Ego: { x: 535, y: 455 },
  Spleen: { x: 235, y: 575 },
  "Solar Plexus": { x: 665, y: 575 },
  Sacral: { x: 450, y: 610 },
  Root: { x: 450, y: 755 },
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

/*
 * V8 geometry: every gate is anchored directly on the visible edge of its center.
 * The side centers are spread outward and Ego is pulled inward to create cleaner
 * straight-line corridors, closer to the traditional BodyGraph proportion.
 */
const GATE_PORTS: Record<number, Point> = {
  // Head bottom edge
  64: { x: 415, y: 118 }, 61: { x: 450, y: 118 }, 63: { x: 485, y: 118 },

  // Ajna top / bottom edges
  47: { x: 415, y: 152 }, 24: { x: 450, y: 152 }, 4: { x: 485, y: 152 },
  17: { x: 415, y: 226 }, 43: { x: 450, y: 226 }, 11: { x: 485, y: 226 },

  // Throat top, sides, bottom
  62: { x: 415, y: 270 }, 23: { x: 450, y: 270 }, 56: { x: 485, y: 270 },
  16: { x: 395, y: 292 }, 20: { x: 395, y: 323 },
  45: { x: 505, y: 292 }, 12: { x: 505, y: 315 }, 35: { x: 505, y: 338 },
  31: { x: 420, y: 350 }, 8: { x: 450, y: 350 }, 33: { x: 480, y: 350 },

  // G center diamond edges
  1: { x: 430, y: 398 }, 7: { x: 450, y: 390 }, 13: { x: 470, y: 398 },
  10: { x: 398, y: 438 }, 25: { x: 502, y: 438 },
  2: { x: 430, y: 478 }, 15: { x: 450, y: 490 }, 46: { x: 470, y: 478 },

  // Ego moved inward. Ports sit on triangle edges.
  21: { x: 535, y: 420 },
  51: { x: 515, y: 449 },
  26: { x: 507, y: 481 },
  40: { x: 563, y: 481 },

  // Spleen moved outward left. Right edge + lower edge ports.
  48: { x: 310, y: 535 }, 57: { x: 310, y: 553 }, 44: { x: 310, y: 575 }, 50: { x: 310, y: 596 },
  32: { x: 286, y: 610 }, 18: { x: 255, y: 625 }, 28: { x: 220, y: 639 },

  // Solar Plexus moved outward right. Left edge + lower edge ports.
  36: { x: 590, y: 535 }, 22: { x: 590, y: 553 }, 37: { x: 590, y: 575 }, 6: { x: 590, y: 596 },
  49: { x: 614, y: 610 }, 55: { x: 645, y: 625 }, 30: { x: 680, y: 639 },

  // Sacral top, sides, bottom
  5: { x: 420, y: 570 }, 14: { x: 450, y: 570 }, 29: { x: 480, y: 570 },
  34: { x: 400, y: 590 }, 27: { x: 400, y: 610 }, 59: { x: 400, y: 635 },
  3: { x: 420, y: 650 }, 9: { x: 450, y: 650 }, 42: { x: 480, y: 650 },

  // Root top + right edge
  54: { x: 394, y: 710 }, 58: { x: 412, y: 710 }, 38: { x: 430, y: 710 },
  60: { x: 448, y: 710 }, 52: { x: 466, y: 710 }, 53: { x: 484, y: 710 }, 19: { x: 506, y: 710 },
  39: { x: 510, y: 738 }, 41: { x: 510, y: 765 },
};

function centerShape(center: CenterId, defined: boolean) {
  const p = CENTER_POINTS[center];
  const fill = defined ? CENTER_FILL[center] : "#ffffff";
  const common = { fill, stroke: "#252433", strokeWidth: 2.8 };

  if (center === "Head") {
    return <polygon points={`${p.x},${p.y - 43} ${p.x - 58},${p.y + 36} ${p.x + 58},${p.y + 36}`} {...common} />;
  }
  if (center === "Ajna") {
    return <polygon points={`${p.x - 58},${p.y - 36} ${p.x + 58},${p.y - 36} ${p.x},${p.y + 38}`} {...common} />;
  }
  if (center === "G") {
    return <polygon points={`${p.x},${p.y - 48} ${p.x + 52},${p.y} ${p.x},${p.y + 52} ${p.x - 52},${p.y}`} {...common} />;
  }
  if (center === "Ego") {
    return <polygon points={`${p.x},${p.y - 35} ${p.x - 35},${p.y + 30} ${p.x + 35},${p.y + 30}`} {...common} />;
  }
  if (center === "Spleen") {
    return <polygon points={`${p.x - 70},${p.y - 50} ${p.x + 75},${p.y} ${p.x - 70},${p.y + 70}`} {...common} />;
  }
  if (center === "Solar Plexus") {
    return <polygon points={`${p.x + 70},${p.y - 50} ${p.x - 75},${p.y} ${p.x + 70},${p.y + 70}`} {...common} />;
  }
  if (center === "Root") {
    return <rect x={p.x - 60} y={p.y - 45} width={120} height={90} rx={9} {...common} />;
  }
  return <rect x={p.x - 55} y={p.y - 40} width={110} height={80} rx={center === "Throat" ? 5 : 9} {...common} />;
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

function lerp(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function offsetSegment(a: Point, b: Point, offset: number): [Point, Point] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  const ox = (-dy / length) * offset;
  const oy = (dx / length) * offset;
  return [
    { x: a.x + ox, y: a.y + oy },
    { x: b.x + ox, y: b.y + oy },
  ];
}

function StraightSegment({ a, b, source, width = 6.6 }: { a: Point; b: Point; source: GateSource; width?: number }) {
  const colors = sourceColors(source);
  if (!colors.length) return null;

  if (colors.length === 1) {
    return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={colors[0]} strokeWidth={width} strokeLinecap="butt" />;
  }

  const [a1, b1] = offsetSegment(a, b, -2.4);
  const [a2, b2] = offsetSegment(a, b, 2.4);
  return (
    <g>
      <line x1={a1.x} y1={a1.y} x2={b1.x} y2={b1.y} stroke={colors[0]} strokeWidth={3.2} strokeLinecap="butt" />
      <line x1={a2.x} y1={a2.y} x2={b2.x} y2={b2.y} stroke={colors[1]} strokeWidth={3.2} strokeLinecap="butt" />
    </g>
  );
}

function gateTextColor(source: GateSource) {
  if (source === "design") return "#d94a43";
  if (source === "personality") return "#24212d";
  if (source === "both") return "#7f2d37";
  return "#77736d";
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
          const mid = lerp(a, b, 0.5);
          const complete = activeChannels.has(id);
          const sourceA = sourceForGate(channel.gateA, personalityGates, designGates);
          const sourceB = sourceForGate(channel.gateB, personalityGates, designGates);
          const stubA = lerp(a, b, 0.31);
          const stubB = lerp(b, a, 0.31);

          return (
            <g key={id}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#cbc7bf"
                strokeWidth="2.35"
                strokeOpacity="0.75"
                strokeLinecap="butt"
              />
              {complete ? (
                <>
                  {sourceA !== "inactive" && <StraightSegment a={a} b={mid} source={sourceA} width={6.8} />}
                  {sourceB !== "inactive" && <StraightSegment a={b} b={mid} source={sourceB} width={6.8} />}
                </>
              ) : (
                <>
                  {sourceA !== "inactive" && <StraightSegment a={a} b={stubA} source={sourceA} width={6.2} />}
                  {sourceB !== "inactive" && <StraightSegment a={b} b={stubB} source={sourceB} width={6.2} />}
                </>
              )}
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
              <circle cx={port.x} cy={port.y} r="8.5" fill="#fbfaf7" stroke="#fbfaf7" strokeWidth="1.5" />
              <text x={port.x} y={port.y + 3.2} textAnchor="middle" fontSize="9.4" fontWeight="900" fill={gateTextColor(source)}>{gate}</text>
            </g>
          );
        })}
      </g>

      <g transform="translate(450 825)">
        <rect x="-245" y="-24" width="490" height="34" rx="17" fill="#ffffff" stroke="#e3dfd7" />
        <text x="0" y="-2" textAnchor="middle" fontSize="14" fontWeight="700" fill="#5f5a54">
          {chart.type} · {chart.authority} · {chart.profile} · {chart.definition}
        </text>
      </g>
    </svg>
  );
}
