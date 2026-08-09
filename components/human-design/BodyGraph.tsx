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
 * V11: fixed BodyGraph geometry with deliberately separated centers.
 * Every channel is a single straight Gate-to-Gate line. No curves, no
 * waypoint routing and no force-directed layout.
 */
const CENTER_SHAPES: Record<CenterId, Shape> = {
  Head: { kind: "polygon", points: [{ x: 450, y: 52 }, { x: 402, y: 138 }, { x: 498, y: 138 }] },
  Ajna: { kind: "polygon", points: [{ x: 402, y: 174 }, { x: 498, y: 174 }, { x: 450, y: 258 }] },
  Throat: { kind: "rect", x: 397, y: 300, width: 106, height: 96, rx: 6 },
  G: { kind: "polygon", points: [{ x: 450, y: 440 }, { x: 505, y: 492 }, { x: 450, y: 548 }, { x: 395, y: 492 }] },
  Ego: { kind: "polygon", points: [{ x: 540, y: 448 }, { x: 514, y: 520 }, { x: 566, y: 520 }] },
  Spleen: { kind: "polygon", points: [{ x: 125, y: 575 }, { x: 318, y: 640 }, { x: 125, y: 720 }] },
  "Solar Plexus": { kind: "polygon", points: [{ x: 775, y: 575 }, { x: 582, y: 640 }, { x: 775, y: 720 }] },
  Sacral: { kind: "rect", x: 397, y: 605, width: 106, height: 106, rx: 9 },
  Root: { kind: "rect", x: 390, y: 775, width: 120, height: 102, rx: 8 },
};

const CENTER_LABELS: Record<CenterId, Point> = {
  Head: { x: 450, y: 98 },
  Ajna: { x: 450, y: 211 },
  Throat: { x: 450, y: 350 },
  G: { x: 450, y: 498 },
  Ego: { x: 540, y: 493 },
  Spleen: { x: 202, y: 650 },
  "Solar Plexus": { x: 698, y: 650 },
  Sacral: { x: 450, y: 660 },
  Root: { x: 450, y: 830 },
};

const BODY_SYMBOL: Record<string, string> = {
  Sun: "☉", Earth: "⊕", Moon: "☽", NorthNode: "☊", SouthNode: "☋",
  Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄",
  Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

const GATE_PORTS: Record<number, Point> = {
  64: { x: 420, y: 138 }, 61: { x: 450, y: 138 }, 63: { x: 480, y: 138 },
  47: { x: 420, y: 174 }, 24: { x: 450, y: 174 }, 4: { x: 480, y: 174 },
  17: { x: 426, y: 216 }, 43: { x: 450, y: 258 }, 11: { x: 474, y: 216 },

  62: { x: 420, y: 300 }, 23: { x: 450, y: 300 }, 56: { x: 480, y: 300 },
  16: { x: 397, y: 322 }, 20: { x: 397, y: 362 },
  45: { x: 503, y: 322 }, 12: { x: 503, y: 350 }, 35: { x: 503, y: 378 },
  31: { x: 420, y: 396 }, 8: { x: 450, y: 396 }, 33: { x: 480, y: 396 },

  7: { x: 450, y: 440 }, 1: { x: 423, y: 466 }, 13: { x: 477, y: 466 },
  10: { x: 395, y: 492 }, 25: { x: 505, y: 492 },
  2: { x: 423, y: 520 }, 15: { x: 450, y: 548 }, 46: { x: 477, y: 520 },

  21: { x: 532, y: 470 }, 51: { x: 520, y: 500 }, 26: { x: 526, y: 520 }, 40: { x: 554, y: 520 },

  48: { x: 292, y: 631 }, 57: { x: 307, y: 636 }, 44: { x: 318, y: 640 },
  50: { x: 306, y: 651 }, 32: { x: 265, y: 669 }, 18: { x: 220, y: 688 }, 28: { x: 165, y: 710 },

  36: { x: 608, y: 631 }, 22: { x: 593, y: 636 }, 37: { x: 582, y: 640 },
  6: { x: 594, y: 651 }, 49: { x: 635, y: 669 }, 55: { x: 680, y: 688 }, 30: { x: 735, y: 710 },

  5: { x: 424, y: 605 }, 14: { x: 450, y: 605 }, 29: { x: 476, y: 605 },
  34: { x: 397, y: 628 }, 27: { x: 397, y: 657 }, 59: { x: 397, y: 688 },
  3: { x: 424, y: 711 }, 9: { x: 450, y: 711 }, 42: { x: 476, y: 711 },

  54: { x: 398, y: 775 }, 58: { x: 415, y: 775 }, 38: { x: 432, y: 775 },
  60: { x: 450, y: 775 }, 52: { x: 468, y: 775 }, 53: { x: 485, y: 775 }, 19: { x: 502, y: 775 },
  39: { x: 510, y: 806 }, 41: { x: 510, y: 846 },
};

const GATE_CENTER = new Map<number, CenterId>();
for (const channel of CHANNELS) {
  GATE_CENTER.set(channel.gateA, channel.centerA);
  GATE_CENTER.set(channel.gateB, channel.centerB);
}

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
  const port = GATE_PORTS[gate];
  const center = GATE_CENTER.get(gate);
  if (!center) return port;
  const target = CENTER_LABELS[center];
  const dx = target.x - port.x;
  const dy = target.y - port.y;
  const len = Math.hypot(dx, dy) || 1;
  const inset = 10;
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

  return <svg viewBox="0 0 900 930" width="100%" style={{ maxWidth: width, height: "auto" }} role="img" aria-label="Human Design BodyGraph">
    <rect x="0" y="0" width="900" height="930" rx="24" fill="#fbfaf7" />
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
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#8d8981" strokeWidth="9" strokeLinecap="butt" opacity="0.75" />
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#ffffff" strokeWidth="5.5" strokeLinecap="butt" />
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
        return <text key={`gate-${gate}`} x={p.x} y={p.y + 3.5} textAnchor="middle" fontSize="10.5" fontWeight="900" fill={gateTextColor(source)} paintOrder="stroke" stroke="#fbfaf7" strokeWidth="2.8" strokeLinejoin="round">{gate}</text>;
      })}
    </g>

    <g transform="translate(450 906)">
      <rect x="-245" y="-22" width="490" height="32" rx="16" fill="#ffffff" stroke="#ddd8cf" />
      <text x="0" y="-2" textAnchor="middle" fontSize="14" fontWeight="700" fill="#5a5650">{chart.type} · {chart.authority} · {chart.profile} · {chart.definition}</text>
    </g>
  </svg>;
}
