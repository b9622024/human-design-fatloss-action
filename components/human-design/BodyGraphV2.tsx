"use client";

import type { HumanDesignActivation } from "@/lib/human-design/activations";
import { CHANNELS, type CenterId, type CoreHumanDesignChart } from "@/lib/human-design/topology";

export const BODYGRAPH_RENDERER_VERSION = "R6.0";

type Props = {
  chart: CoreHumanDesignChart;
  personalityActivations?: HumanDesignActivation[];
  designActivations?: HumanDesignActivation[];
  width?: number;
};

type Point = { x: number; y: number };
type Shape =
  | { kind: "polygon"; points: Point[] }
  | { kind: "rect"; x: number; y: number; width: number; height: number; rx: number };
type GateSource = "personality" | "design" | "both" | "inactive";

const BODY_SYMBOL: Record<string, string> = {
  Sun: "☉", Earth: "⊕", Moon: "☽", NorthNode: "☊", SouthNode: "☋",
  Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄",
  Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

const CENTER_FILL: Record<CenterId, string> = {
  Head: "#f4df6b",
  Ajna: "#8dbca8",
  Throat: "#b18c5e",
  G: "#f2de67",
  Ego: "#ffffff",
  Spleen: "#ffffff",
  "Solar Plexus": "#ffffff",
  Sacral: "#cf6862",
  Root: "#b8845d",
};

/*
 * R6.0: center-local gate-slot renderer.
 *
 * The geometry is authored from the supplied reference image. Gate positions
 * are no longer distributed from a global row. Every gate belongs to an
 * explicit slot on one visible edge of its own center. Channels then connect
 * those slots. This keeps labels attached to their center and prevents the
 * Root / Spleen / Solar clusters from collapsing into one another.
 */
const SHAPES: Record<CenterId, Shape> = {
  Head: { kind: "polygon", points: [{ x: 450, y: 42 }, { x: 406, y: 122 }, { x: 494, y: 122 }] },
  Ajna: { kind: "polygon", points: [{ x: 406, y: 148 }, { x: 494, y: 148 }, { x: 450, y: 228 }] },
  Throat: { kind: "rect", x: 408, y: 260, width: 84, height: 88, rx: 4 },
  G: { kind: "polygon", points: [{ x: 450, y: 370 }, { x: 496, y: 418 }, { x: 450, y: 466 }, { x: 404, y: 418 }] },
  Ego: { kind: "polygon", points: [{ x: 520, y: 392 }, { x: 501, y: 451 }, { x: 552, y: 451 }] },
  Spleen: { kind: "polygon", points: [{ x: 252, y: 500 }, { x: 388, y: 558 }, { x: 252, y: 622 }] },
  "Solar Plexus": { kind: "polygon", points: [{ x: 648, y: 500 }, { x: 512, y: 558 }, { x: 648, y: 622 }] },
  Sacral: { kind: "rect", x: 396, y: 530, width: 108, height: 98, rx: 4 },
  Root: { kind: "rect", x: 378, y: 690, width: 144, height: 112, rx: 4 },
};

const LABELS: Record<CenterId, Point> = {
  Head: { x: 450, y: 86 }, Ajna: { x: 450, y: 185 }, Throat: { x: 450, y: 305 },
  G: { x: 450, y: 423 }, Ego: { x: 526, y: 428 }, Spleen: { x: 304, y: 565 },
  "Solar Plexus": { x: 596, y: 565 }, Sacral: { x: 450, y: 582 }, Root: { x: 450, y: 758 },
};

/*
 * Explicit reference-style gate slots.
 * Dense triangular centers use different edges instead of a single diagonal
 * list. The Root is deliberately wider so all top gates remain readable.
 */
const PORT: Record<number, Point> = {
  // Head bottom edge
  64: { x: 420, y: 122 }, 61: { x: 450, y: 122 }, 63: { x: 480, y: 122 },

  // Ajna top + lower edges
  47: { x: 420, y: 148 }, 24: { x: 450, y: 148 }, 4: { x: 480, y: 148 },
  17: { x: 424, y: 195 }, 43: { x: 450, y: 228 }, 11: { x: 476, y: 195 },

  // Throat perimeter
  62: { x: 425, y: 260 }, 23: { x: 450, y: 260 }, 56: { x: 475, y: 260 },
  16: { x: 408, y: 279 }, 20: { x: 408, y: 326 },
  45: { x: 492, y: 279 }, 12: { x: 492, y: 304 }, 35: { x: 492, y: 331 },
  31: { x: 425, y: 348 }, 8: { x: 450, y: 348 }, 33: { x: 475, y: 348 },

  // G center perimeter
  7: { x: 450, y: 370 }, 1: { x: 425, y: 394 }, 13: { x: 475, y: 394 },
  10: { x: 404, y: 418 }, 25: { x: 496, y: 418 },
  2: { x: 425, y: 442 }, 46: { x: 475, y: 442 }, 15: { x: 450, y: 466 },

  // Ego perimeter
  21: { x: 514, y: 410 }, 51: { x: 506, y: 435 }, 26: { x: 507, y: 451 }, 40: { x: 543, y: 451 },

  // Spleen: upper edge -> inner apex -> lower edge
  48: { x: 338, y: 537 },
  57: { x: 388, y: 558 },
  44: { x: 369, y: 567 },
  50: { x: 350, y: 576 },
  32: { x: 322, y: 589 },
  18: { x: 286, y: 606 },
  28: { x: 255, y: 620 },

  // Solar Plexus mirrors Spleen
  36: { x: 562, y: 537 },
  22: { x: 512, y: 558 },
  37: { x: 531, y: 567 },
  6: { x: 550, y: 576 },
  49: { x: 578, y: 589 },
  55: { x: 614, y: 606 },
  30: { x: 645, y: 620 },

  // Sacral perimeter
  5: { x: 423, y: 530 }, 14: { x: 450, y: 530 }, 29: { x: 477, y: 530 },
  34: { x: 396, y: 552 }, 27: { x: 396, y: 578 }, 59: { x: 396, y: 605 },
  3: { x: 423, y: 628 }, 9: { x: 450, y: 628 }, 42: { x: 477, y: 628 },

  // Root: top edge + right edge. Seven top gates are genuinely separated.
  54: { x: 387, y: 690 }, 58: { x: 408, y: 690 }, 38: { x: 429, y: 690 },
  60: { x: 450, y: 690 }, 52: { x: 471, y: 690 }, 53: { x: 492, y: 690 }, 19: { x: 513, y: 690 },
  39: { x: 522, y: 731 }, 41: { x: 522, y: 777 },
};

function canonical(a: number, b: number) {
  return `${Math.min(a, b)}-${Math.max(a, b)}`;
}

function gateSource(gate: number, personality: Set<number>, design: Set<number>): GateSource {
  const p = personality.has(gate);
  const d = design.has(gate);
  if (p && d) return "both";
  if (p) return "personality";
  if (d) return "design";
  return "inactive";
}

function lineColor(source: GateSource) {
  if (source === "design") return "#d84c43";
  if (source === "personality") return "#181820";
  if (source === "both") return "#181820";
  return "transparent";
}

function renderCenter(center: CenterId, defined: boolean) {
  const s = SHAPES[center];
  const common = { fill: defined ? CENTER_FILL[center] : "#fff", stroke: "#171720", strokeWidth: 3.2 };
  if (s.kind === "rect") return <rect x={s.x} y={s.y} width={s.width} height={s.height} rx={s.rx} {...common} />;
  return <polygon points={s.points.map((p) => `${p.x},${p.y}`).join(" ")} {...common} />;
}

function GateLabel({ gate, source }: { gate: number; source: GateSource }) {
  const p = PORT[gate];
  if (!p) return null;
  const fill = source === "design" ? "#d84c43" : source === "both" ? "#a63c35" : source === "personality" ? "#171720" : "#69655f";
  return <g>
    <circle cx={p.x} cy={p.y} r="7.6" fill="#fbfaf7" />
    <text x={p.x} y={p.y + 3.35} textAnchor="middle" fontSize="9.4" fontWeight="900" fill={fill}>{gate}</text>
  </g>;
}

function ActiveSegment({ a, b, source }: { a: Point; b: Point; source: GateSource }) {
  if (source === "inactive") return null;
  if (source === "both") {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const ox = (-dy / len) * 2.0;
    const oy = (dx / len) * 2.0;
    return <g>
      <line x1={a.x + ox} y1={a.y + oy} x2={b.x + ox} y2={b.y + oy} stroke="#171720" strokeWidth="3.8" />
      <line x1={a.x - ox} y1={a.y - oy} x2={b.x - ox} y2={b.y - oy} stroke="#d84c43" strokeWidth="3.8" />
    </g>;
  }
  return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lineColor(source)} strokeWidth="7" strokeLinecap="butt" />;
}

function ActivationPanel({ x, title, color, activations, align }: { x: number; title: string; color: string; activations: HumanDesignActivation[]; align: "left" | "right" }) {
  return <g>
    <text x={x} y="48" textAnchor={align === "left" ? "start" : "end"} fontSize="18" fontWeight="800" fill={color}>{title}</text>
    {activations.map((a, i) => {
      const y = 82 + i * 29;
      return <g key={`${title}-${a.body}`}>
        <text x={x} y={y} textAnchor={align === "left" ? "start" : "end"} fontSize="16" fontWeight="700" fill={color}>{BODY_SYMBOL[a.body] ?? "•"}</text>
        <text x={x + (align === "left" ? 23 : -23)} y={y} textAnchor={align === "left" ? "start" : "end"} fontSize="13.5" fontWeight="700" fill="#24232e">{a.gate}.{a.line}</text>
      </g>;
    })}
  </g>;
}

export function BodyGraph({ chart, personalityActivations = [], designActivations = [], width = 900 }: Props) {
  const defined = new Set(chart.centers);
  const activeChannels = new Set(chart.channels.map((id) => {
    const [a, b] = id.split("-").map(Number);
    return canonical(a, b);
  }));
  const personality = new Set(personalityActivations.map((a) => a.gate));
  const design = new Set(designActivations.map((a) => a.gate));

  return <svg viewBox="0 0 900 846" width="100%" style={{ maxWidth: width, height: "auto" }} role="img" aria-label="Human Design BodyGraph">
    <rect width="900" height="846" rx="24" fill="#fbfaf7" />
    <ActivationPanel x={34} title="Design" color="#d84238" activations={designActivations} align="left" />
    <ActivationPanel x={866} title="Personality" color="#191820" activations={personalityActivations} align="right" />

    {/* Reference rails: one straight line per channel, below centers and labels. */}
    <g opacity="0.82">
      {CHANNELS.map((c) => {
        const a = PORT[c.gateA];
        const b = PORT[c.gateB];
        if (!a || !b) return null;
        return <line key={`rail-${c.id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#aaa69f" strokeWidth="2.35" />;
      })}
    </g>

    {/* Active definition. Complete channels meet at midpoint; hanging gates stay short. */}
    <g>
      {CHANNELS.map((c) => {
        const a = PORT[c.gateA];
        const b = PORT[c.gateB];
        if (!a || !b) return null;
        const id = canonical(c.gateA, c.gateB);
        const sa = gateSource(c.gateA, personality, design);
        const sb = gateSource(c.gateB, personality, design);
        const complete = activeChannels.has(id);
        if (complete) {
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          return <g key={`active-${id}`}>
            <ActiveSegment a={a} b={mid} source={sa} />
            <ActiveSegment a={b} b={mid} source={sb} />
          </g>;
        }
        const aEnd = { x: a.x + (b.x - a.x) * 0.25, y: a.y + (b.y - a.y) * 0.25 };
        const bEnd = { x: b.x + (a.x - b.x) * 0.25, y: b.y + (a.y - b.y) * 0.25 };
        return <g key={`hanging-${id}`}>
          <ActiveSegment a={a} b={aEnd} source={sa} />
          <ActiveSegment a={b} b={bEnd} source={sb} />
        </g>;
      })}
    </g>

    {/* Centers cover rail interiors so every line appears to terminate on the boundary. */}
    <g>
      {(Object.keys(SHAPES) as CenterId[]).map((center) => <g key={center}>
        {renderCenter(center, defined.has(center))}
        <text x={LABELS[center].x} y={LABELS[center].y + 5} textAnchor="middle" fontSize="16" fontWeight="800" fill="#191820">{center === "Solar Plexus" ? "Solar" : center}</text>
      </g>)}
    </g>

    {/* Gate labels always render last, exactly on their center-local slot. */}
    <g>
      {Object.keys(PORT).map((gateText) => {
        const gate = Number(gateText);
        return <GateLabel key={gate} gate={gate} source={gateSource(gate, personality, design)} />;
      })}
    </g>

    <g transform="translate(450 824)">
      <rect x="-245" y="-22" width="490" height="32" rx="16" fill="#fff" stroke="#ddd8cf" />
      <text x="0" y="-2" textAnchor="middle" fontSize="14" fontWeight="700" fill="#5a5650">{chart.type} · {chart.authority} · {chart.profile} · {chart.definition}</text>
    </g>
  </svg>;
}
