"use client";

import type { HumanDesignActivation } from "@/lib/human-design/activations";
import { CHANNELS, type CenterId, type CoreHumanDesignChart } from "@/lib/human-design/topology";

export const BODYGRAPH_RENDERER_VERSION = "R5.0";

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
 * R5.0 is a real drawing reset.
 * The old R3/R4 coordinates are not reused. The scaffold below is authored
 * from one fixed reference-style geometry. Every gate label is attached to a
 * visible center edge. Channels are straight gate-to-gate segments only.
 */
const SHAPES: Record<CenterId, Shape> = {
  Head: { kind: "polygon", points: [{ x: 450, y: 48 }, { x: 405, y: 126 }, { x: 495, y: 126 }] },
  Ajna: { kind: "polygon", points: [{ x: 405, y: 153 }, { x: 495, y: 153 }, { x: 450, y: 232 }] },
  Throat: { kind: "rect", x: 406, y: 265, width: 88, height: 86, rx: 4 },
  G: { kind: "polygon", points: [{ x: 450, y: 375 }, { x: 497, y: 421 }, { x: 450, y: 468 }, { x: 403, y: 421 }] },
  Ego: { kind: "polygon", points: [{ x: 529, y: 392 }, { x: 508, y: 456 }, { x: 568, y: 456 }] },
  Spleen: { kind: "polygon", points: [{ x: 286, y: 500 }, { x: 390, y: 558 }, { x: 286, y: 620 }] },
  "Solar Plexus": { kind: "polygon", points: [{ x: 614, y: 500 }, { x: 510, y: 558 }, { x: 614, y: 620 }] },
  Sacral: { kind: "rect", x: 405, y: 525, width: 90, height: 96, rx: 4 },
  Root: { kind: "rect", x: 395, y: 688, width: 110, height: 108, rx: 4 },
};

const LABELS: Record<CenterId, Point> = {
  Head: { x: 450, y: 91 }, Ajna: { x: 450, y: 191 }, Throat: { x: 450, y: 309 },
  G: { x: 450, y: 426 }, Ego: { x: 539, y: 430 }, Spleen: { x: 326, y: 566 },
  "Solar Plexus": { x: 574, y: 566 }, Sacral: { x: 450, y: 576 }, Root: { x: 450, y: 752 },
};

/* Gate ports live exactly on center borders. */
const PORT: Record<number, Point> = {
  64: { x: 421, y: 126 }, 61: { x: 450, y: 126 }, 63: { x: 479, y: 126 },
  47: { x: 421, y: 153 }, 24: { x: 450, y: 153 }, 4: { x: 479, y: 153 },
  17: { x: 420, y: 206 }, 43: { x: 450, y: 232 }, 11: { x: 480, y: 206 },

  62: { x: 423, y: 265 }, 23: { x: 450, y: 265 }, 56: { x: 477, y: 265 },
  16: { x: 406, y: 283 }, 20: { x: 406, y: 326 },
  45: { x: 494, y: 283 }, 12: { x: 494, y: 307 }, 35: { x: 494, y: 333 },
  31: { x: 423, y: 351 }, 8: { x: 450, y: 351 }, 33: { x: 477, y: 351 },

  7: { x: 450, y: 375 }, 1: { x: 425, y: 400 }, 13: { x: 475, y: 400 },
  10: { x: 403, y: 421 }, 25: { x: 497, y: 421 },
  2: { x: 425, y: 446 }, 46: { x: 475, y: 446 }, 15: { x: 450, y: 468 },

  21: { x: 523, y: 410 }, 51: { x: 513, y: 438 }, 26: { x: 520, y: 456 }, 40: { x: 556, y: 456 },

  /* Spleen inner/top edge: 48 57 44 50 are deliberately separated. */
  48: { x: 384, y: 555 }, 57: { x: 373, y: 562 }, 44: { x: 361, y: 569 }, 50: { x: 349, y: 576 },
  32: { x: 331, y: 588 }, 18: { x: 309, y: 602 }, 28: { x: 289, y: 616 },

  /* Solar mirrors Spleen: 36 22 37 6 are separated on inner edge. */
  36: { x: 516, y: 555 }, 22: { x: 527, y: 562 }, 37: { x: 539, y: 569 }, 6: { x: 551, y: 576 },
  49: { x: 569, y: 588 }, 55: { x: 591, y: 602 }, 30: { x: 611, y: 616 },

  5: { x: 425, y: 525 }, 14: { x: 450, y: 525 }, 29: { x: 475, y: 525 },
  34: { x: 405, y: 548 }, 27: { x: 405, y: 573 }, 59: { x: 405, y: 598 },
  3: { x: 425, y: 621 }, 9: { x: 450, y: 621 }, 42: { x: 475, y: 621 },

  /* Root top gates are evenly spread across the entire top edge. */
  54: { x: 402, y: 688 }, 58: { x: 418, y: 688 }, 38: { x: 434, y: 688 },
  60: { x: 450, y: 688 }, 52: { x: 466, y: 688 }, 53: { x: 482, y: 688 }, 19: { x: 498, y: 688 },
  39: { x: 505, y: 726 }, 41: { x: 505, y: 770 },
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
  if (source === "design") return "#d94a40";
  if (source === "personality") return "#181820";
  if (source === "both") return "#181820";
  return "transparent";
}

function renderCenter(center: CenterId, defined: boolean) {
  const s = SHAPES[center];
  const common = { fill: defined ? CENTER_FILL[center] : "#fff", stroke: "#171720", strokeWidth: 3 };
  if (s.kind === "rect") return <rect x={s.x} y={s.y} width={s.width} height={s.height} rx={s.rx} {...common} />;
  return <polygon points={s.points.map((p) => `${p.x},${p.y}`).join(" ")} {...common} />;
}

function GateLabel({ gate, source }: { gate: number; source: GateSource }) {
  const p = PORT[gate];
  if (!p) return null;
  const fill = source === "design" ? "#d94a40" : source === "both" ? "#9a3030" : source === "personality" ? "#171720" : "#6f6a63";
  return <g>
    <circle cx={p.x} cy={p.y} r="7.2" fill="#fbfaf7" />
    <text x={p.x} y={p.y + 3.2} textAnchor="middle" fontSize="9.2" fontWeight="900" fill={fill}>{gate}</text>
  </g>;
}

function ActiveSegment({ a, b, source }: { a: Point; b: Point; source: GateSource }) {
  if (source === "inactive") return null;
  if (source === "both") {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const ox = (-dy / len) * 2.1;
    const oy = (dx / len) * 2.1;
    return <g>
      <line x1={a.x + ox} y1={a.y + oy} x2={b.x + ox} y2={b.y + oy} stroke="#171720" strokeWidth="3.5" />
      <line x1={a.x - ox} y1={a.y - oy} x2={b.x - ox} y2={b.y - oy} stroke="#d94a40" strokeWidth="3.5" />
    </g>;
  }
  return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lineColor(source)} strokeWidth="6.5" strokeLinecap="butt" />;
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

  return <svg viewBox="0 0 900 840" width="100%" style={{ maxWidth: width, height: "auto" }} role="img" aria-label="Human Design BodyGraph">
    <rect width="900" height="840" rx="24" fill="#fbfaf7" />
    <ActivationPanel x={34} title="Design" color="#d84238" activations={designActivations} align="left" />
    <ActivationPanel x={866} title="Personality" color="#191820" activations={personalityActivations} align="right" />

    {/* All 36 reference rails are simple straight gate-to-gate segments. */}
    <g opacity="0.72">
      {CHANNELS.map((c) => {
        const a = PORT[c.gateA];
        const b = PORT[c.gateB];
        if (!a || !b) return null;
        return <line key={`rail-${c.id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#b6b2ab" strokeWidth="2.15" />;
      })}
    </g>

    {/* Active definition. Complete channels meet at the true midpoint; hanging gates stop at 30%. */}
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
        const aEnd = { x: a.x + (b.x - a.x) * 0.30, y: a.y + (b.y - a.y) * 0.30 };
        const bEnd = { x: b.x + (a.x - b.x) * 0.30, y: b.y + (a.y - b.y) * 0.30 };
        return <g key={`hanging-${id}`}>
          <ActiveSegment a={a} b={aEnd} source={sa} />
          <ActiveSegment a={b} b={bEnd} source={sb} />
        </g>;
      })}
    </g>

    {/* Centers are painted after lines so channels visually terminate at the center border. */}
    <g>
      {(Object.keys(SHAPES) as CenterId[]).map((center) => <g key={center}>
        {renderCenter(center, defined.has(center))}
        <text x={LABELS[center].x} y={LABELS[center].y + 5} textAnchor="middle" fontSize="16" fontWeight="800" fill="#191820">{center === "Solar Plexus" ? "Solar" : center}</text>
      </g>)}
    </g>

    {/* Gate labels are always last and remain fixed to their center border. */}
    <g>
      {Object.keys(PORT).map((gateText) => {
        const gate = Number(gateText);
        return <GateLabel key={gate} gate={gate} source={gateSource(gate, personality, design)} />;
      })}
    </g>

    <g transform="translate(450 818)">
      <rect x="-245" y="-22" width="490" height="32" rx="16" fill="#fff" stroke="#ddd8cf" />
      <text x="0" y="-2" textAnchor="middle" fontSize="14" fontWeight="700" fill="#5a5650">{chart.type} · {chart.authority} · {chart.profile} · {chart.definition}</text>
    </g>
  </svg>;
}
