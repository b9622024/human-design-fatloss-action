"use client";

import type { HumanDesignActivation } from "@/lib/human-design/activations";
import { CHANNELS, type CenterId, type CoreHumanDesignChart } from "@/lib/human-design/topology";

export const BODYGRAPH_RENDERER_VERSION = "V12";

type Props = {
  chart: CoreHumanDesignChart;
  personalityActivations?: HumanDesignActivation[];
  designActivations?: HumanDesignActivation[];
  width?: number;
};

type Point = { x: number; y: number };
type GateSource = "personality" | "design" | "both" | "inactive";
type Shape =
  | { kind: "polygon"; points: Point[] }
  | { kind: "rect"; x: number; y: number; width: number; height: number; rx: number };

const CENTER_FILL: Record<CenterId, string> = {
  Head: "#f4dd62",
  Ajna: "#86bca4",
  Throat: "#a98659",
  G: "#f2dc62",
  Ego: "#d76466",
  Spleen: "#ad754a",
  "Solar Plexus": "#c38d5f",
  Sacral: "#cf635d",
  Root: "#b6825d",
};

/*
 * V12: straight gate-to-gate topology with re-spaced gate ports.
 * Crowded gate clusters are deliberately spread along their owning center edge
 * so labels stay readable without disconnecting from the actual channel origin.
 */
const CENTER_SHAPES: Record<CenterId, Shape> = {
  Head: { kind: "polygon", points: [{ x: 450, y: 52 }, { x: 402, y: 138 }, { x: 498, y: 138 }] },
  Ajna: { kind: "polygon", points: [{ x: 402, y: 174 }, { x: 498, y: 174 }, { x: 450, y: 258 }] },
  Throat: { kind: "rect", x: 395, y: 300, width: 110, height: 96, rx: 6 },
  G: { kind: "polygon", points: [{ x: 450, y: 440 }, { x: 505, y: 492 }, { x: 450, y: 548 }, { x: 395, y: 492 }] },
  Ego: { kind: "polygon", points: [{ x: 535, y: 452 }, { x: 510, y: 522 }, { x: 560, y: 522 }] },
  Spleen: { kind: "polygon", points: [{ x: 78, y: 570 }, { x: 300, y: 640 }, { x: 78, y: 724 }] },
  "Solar Plexus": { kind: "polygon", points: [{ x: 822, y: 570 }, { x: 600, y: 640 }, { x: 822, y: 724 }] },
  Sacral: { kind: "rect", x: 393, y: 606, width: 114, height: 108, rx: 9 },
  Root: { kind: "rect", x: 372, y: 776, width: 156, height: 106, rx: 8 },
};

const CENTER_LABELS: Record<CenterId, Point> = {
  Head: { x: 450, y: 98 },
  Ajna: { x: 450, y: 211 },
  Throat: { x: 450, y: 350 },
  G: { x: 450, y: 498 },
  Ego: { x: 535, y: 494 },
  Spleen: { x: 180, y: 652 },
  "Solar Plexus": { x: 720, y: 652 },
  Sacral: { x: 450, y: 662 },
  Root: { x: 450, y: 838 },
};

const BODY_SYMBOL: Record<string, string> = {
  Sun: "☉", Earth: "⊕", Moon: "☽", NorthNode: "☊", SouthNode: "☋",
  Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄",
  Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

/* Channel origins. These coordinates sit on the visible boundary of each center. */
const GATE_PORTS: Record<number, Point> = {
  64: { x: 420, y: 138 }, 61: { x: 450, y: 138 }, 63: { x: 480, y: 138 },
  47: { x: 420, y: 174 }, 24: { x: 450, y: 174 }, 4: { x: 480, y: 174 },
  17: { x: 420, y: 206 }, 43: { x: 450, y: 258 }, 11: { x: 480, y: 206 },

  62: { x: 420, y: 300 }, 23: { x: 450, y: 300 }, 56: { x: 480, y: 300 },
  16: { x: 395, y: 318 }, 20: { x: 395, y: 365 },
  45: { x: 505, y: 318 }, 12: { x: 505, y: 349 }, 35: { x: 505, y: 380 },
  31: { x: 418, y: 396 }, 8: { x: 450, y: 396 }, 33: { x: 482, y: 396 },

  7: { x: 450, y: 440 }, 1: { x: 420, y: 468 }, 13: { x: 480, y: 468 },
  10: { x: 395, y: 492 }, 25: { x: 505, y: 492 },
  2: { x: 420, y: 522 }, 15: { x: 450, y: 548 }, 46: { x: 480, y: 522 },

  21: { x: 529, y: 469 }, 51: { x: 514, y: 501 }, 26: { x: 518, y: 522 }, 40: { x: 552, y: 522 },

  /* Spleen gates are deliberately distributed along the two sloping edges. */
  48: { x: 276, y: 632 }, 57: { x: 288, y: 636 }, 44: { x: 300, y: 640 },
  50: { x: 286, y: 646 }, 32: { x: 246, y: 660 }, 18: { x: 196, y: 679 }, 28: { x: 132, y: 704 },

  /* Solar Plexus mirrors Spleen and uses the same visual spacing. */
  36: { x: 624, y: 632 }, 22: { x: 612, y: 636 }, 37: { x: 600, y: 640 },
  6: { x: 614, y: 646 }, 49: { x: 654, y: 660 }, 55: { x: 704, y: 679 }, 30: { x: 768, y: 704 },

  5: { x: 422, y: 606 }, 14: { x: 450, y: 606 }, 29: { x: 478, y: 606 },
  34: { x: 393, y: 628 }, 27: { x: 393, y: 658 }, 59: { x: 393, y: 690 },
  3: { x: 422, y: 714 }, 9: { x: 450, y: 714 }, 42: { x: 478, y: 714 },

  /* Root top edge is widened so seven gates have independent readable positions. */
  54: { x: 382, y: 776 }, 58: { x: 405, y: 776 }, 38: { x: 428, y: 776 },
  60: { x: 450, y: 776 }, 52: { x: 472, y: 776 }, 53: { x: 495, y: 776 }, 19: { x: 518, y: 776 },
  39: { x: 528, y: 810 }, 41: { x: 528, y: 852 },
};

const GATE_CENTER = new Map<number, CenterId>();
for (const channel of CHANNELS) {
  GATE_CENTER.set(channel.gateA, channel.centerA);
  GATE_CENTER.set(channel.gateB, channel.centerB);
}

/*
 * Label points normally use a small inward inset from the port. Crowded clusters
 * get explicit offsets so the number remains visually attached to its own port
 * while no two labels overlap.
 */
const GATE_LABEL_OVERRIDES: Partial<Record<number, Point>> = {
  48: { x: 276, y: 622 }, 57: { x: 289, y: 634 }, 44: { x: 306, y: 646 }, 50: { x: 285, y: 657 },
  36: { x: 624, y: 622 }, 22: { x: 611, y: 634 }, 37: { x: 594, y: 646 }, 6: { x: 615, y: 657 },
  54: { x: 382, y: 787 }, 58: { x: 405, y: 787 }, 38: { x: 428, y: 787 },
  60: { x: 450, y: 787 }, 52: { x: 472, y: 787 }, 53: { x: 495, y: 787 }, 19: { x: 518, y: 787 },
  21: { x: 529, y: 479 }, 51: { x: 516, y: 503 }, 26: { x: 525, y: 513 }, 40: { x: 548, y: 513 },
};

function canonicalChannelId(a: number, b: number) {
  return `${Math.min(a, b)}-${Math.max(a, b)}`;
}

function sourceForGate(gate: number, personality: Set<number>, design: Set<number>): GateSource {
  const p = personality.has(gate);
  const d = design.has(gate);
  if (p && d) return "both";
  if (p) return "personality";
  if (d) return "design";
  return "inactive";
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function lerp(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function offsetSegment(a: Point, b: Point, offset: number): [Point, Point] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ox = (-dy / len) * offset;
  const oy = (dx / len) * offset;
  return [{ x: a.x + ox, y: a.y + oy }, { x: b.x + ox, y: b.y + oy }];
}

function ColoredLine({ a, b, source }: { a: Point; b: Point; source: GateSource }) {
  if (source === "inactive") return null;
  if (source === "personality") return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#191820" strokeWidth="7" strokeLinecap="butt" />;
  if (source === "design") return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#d84238" strokeWidth="7" strokeLinecap="butt" />;
  const [a1, b1] = offsetSegment(a, b, -2.2);
  const [a2, b2] = offsetSegment(a, b, 2.2);
  return <g>
    <line x1={a1.x} y1={a1.y} x2={b1.x} y2={b1.y} stroke="#191820" strokeWidth="3.2" strokeLinecap="butt" />
    <line x1={a2.x} y1={a2.y} x2={b2.x} y2={b2.y} stroke="#d84238" strokeWidth="3.2" strokeLinecap="butt" />
  </g>;
}

function renderCenter(center: CenterId, defined: boolean) {
  const shape = CENTER_SHAPES[center];
  const fill = defined ? CENTER_FILL[center] : "#ffffff";
  const common = { fill, stroke: "#191820", strokeWidth: 3 };
  if (shape.kind === "rect") return <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={shape.rx} {...common} />;
  return <polygon points={shape.points.map((p) => `${p.x},${p.y}`).join(" ")} {...common} />;
}

function gateLabelPoint(gate: number): Point {
  const override = GATE_LABEL_OVERRIDES[gate];
  if (override) return override;
  const port = GATE_PORTS[gate];
  const center = GATE_CENTER.get(gate);
  if (!center) return port;
  const target = CENTER_LABELS[center];
  const dx = target.x - port.x;
  const dy = target.y - port.y;
  const len = Math.hypot(dx, dy) || 1;
  const inset = 9;
  return { x: port.x + (dx / len) * inset, y: port.y + (dy / len) * inset };
}

function gateTextColor(source: GateSource) {
  if (source === "design") return "#d84238";
  if (source === "personality") return "#191820";
  if (source === "both") return "#762732";
  return "#4d4a45";
}

function ActivationPanel({ x, title, color, activations, align }: { x: number; title: string; color: string; activations: HumanDesignActivation[]; align: "left" | "right" }) {
  const rowH = 31;
  const startY = 88;
  return <g>
    <text x={x} y="52" textAnchor={align === "left" ? "start" : "end"} fontSize="18" fontWeight="800" fill={color}>{title}</text>
    {activations.map((a, i) => {
      const y = startY + i * rowH;
      return <g key={`${title}-${a.body}`}>
        <text x={x} y={y} textAnchor={align === "left" ? "start" : "end"} fontSize="18" fontWeight="700" fill={color}>{BODY_SYMBOL[a.body] ?? "•"}</text>
        <text x={x + (align === "left" ? 25 : -25)} y={y} textAnchor={align === "left" ? "start" : "end"} fontSize="14" fontWeight="700" fill="#252433">{a.gate}.{a.line}</text>
      </g>;
    })}
  </g>;
}

export function BodyGraph({ chart, personalityActivations = [], designActivations = [], width = 900 }: Props) {
  const defined = new Set(chart.centers);
  const activeChannels = new Set(chart.channels);
  const personalityGates = new Set(personalityActivations.map((a) => a.gate));
  const designGates = new Set(designActivations.map((a) => a.gate));

  return <svg viewBox="0 0 900 940" width="100%" style={{ maxWidth: width, height: "auto" }} role="img" aria-label="Human Design BodyGraph">
    <rect x="0" y="0" width="900" height="940" rx="24" fill="#fbfaf7" />
    <ActivationPanel x={34} title="Design" color="#d84238" activations={designActivations} align="left" />
    <ActivationPanel x={866} title="Personality" color="#191820" activations={personalityActivations} align="right" />

    <g>
      {CHANNELS.map((channel) => {
        const a = GATE_PORTS[channel.gateA];
        const b = GATE_PORTS[channel.gateB];
        if (!a || !b) return null;
        const id = canonicalChannelId(channel.gateA, channel.gateB);
        const complete = activeChannels.has(id);
        const sourceA = sourceForGate(channel.gateA, personalityGates, designGates);
        const sourceB = sourceForGate(channel.gateB, personalityGates, designGates);
        const mid = midpoint(a, b);
        const stubA = lerp(a, b, 0.34);
        const stubB = lerp(b, a, 0.34);
        return <g key={id}>
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#8d8981" strokeWidth="8" strokeLinecap="butt" opacity="0.72" />
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#ffffff" strokeWidth="4.8" strokeLinecap="butt" />
          {complete ? <>
            {sourceA !== "inactive" && <ColoredLine a={a} b={mid} source={sourceA} />}
            {sourceB !== "inactive" && <ColoredLine a={b} b={mid} source={sourceB} />}
          </> : <>
            {sourceA !== "inactive" && <ColoredLine a={a} b={stubA} source={sourceA} />}
            {sourceB !== "inactive" && <ColoredLine a={b} b={stubB} source={sourceB} />}
          </>}
        </g>;
      })}
    </g>

    <g>
      {(Object.keys(CENTER_SHAPES) as CenterId[]).map((center) => <g key={center}>
        {renderCenter(center, defined.has(center))}
        <text x={CENTER_LABELS[center].x} y={CENTER_LABELS[center].y + 5} textAnchor="middle" fontSize="15" fontWeight="800" fill="#191820">{center === "Solar Plexus" ? "Solar" : center}</text>
      </g>)}
    </g>

    <g>
      {Object.keys(GATE_PORTS).map((gateString) => {
        const gate = Number(gateString);
        const p = gateLabelPoint(gate);
        const source = sourceForGate(gate, personalityGates, designGates);
        return <text key={`gate-${gate}`} x={p.x} y={p.y + 3.5} textAnchor="middle" fontSize="10" fontWeight="900" fill={gateTextColor(source)} paintOrder="stroke" stroke="#fbfaf7" strokeWidth="2.4" strokeLinejoin="round">{gate}</text>;
      })}
    </g>

    <g transform="translate(450 918)">
      <rect x="-245" y="-22" width="490" height="32" rx="16" fill="#ffffff" stroke="#ddd8cf" />
      <text x="0" y="-2" textAnchor="middle" fontSize="14" fontWeight="700" fill="#5a5650">{chart.type} · {chart.authority} · {chart.profile} · {chart.definition}</text>
    </g>
  </svg>;
}
