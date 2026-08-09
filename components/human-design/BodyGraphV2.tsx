"use client";

import type { HumanDesignActivation } from "@/lib/human-design/activations";
import { CHANNELS, type CenterId, type CoreHumanDesignChart } from "@/lib/human-design/topology";

export const BODYGRAPH_RENDERER_VERSION = "R3.0";

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
 * R3.0 is intentionally a hard reset of the drawing layer.
 * Nothing below is derived from the old V11-R2.1 interpolation model.
 * The nine centers, sixty-four gate labels and thirty-six channel endpoints
 * share one fixed reference scaffold.  The proportions follow the supplied
 * MAIA/Jovian-style reference: compact center column, close Ego, and side
 * triangles that flank Sacral instead of sitting at the page edges.
 */
const CENTER_SHAPES: Record<CenterId, Shape> = {
  Head: { kind: "polygon", points: [{ x: 450, y: 48 }, { x: 407, y: 124 }, { x: 493, y: 124 }] },
  Ajna: { kind: "polygon", points: [{ x: 407, y: 150 }, { x: 493, y: 150 }, { x: 450, y: 224 }] },
  Throat: { kind: "rect", x: 407, y: 255, width: 86, height: 82, rx: 4 },
  G: { kind: "polygon", points: [{ x: 450, y: 362 }, { x: 495, y: 405 }, { x: 450, y: 450 }, { x: 405, y: 405 }] },
  Ego: { kind: "polygon", points: [{ x: 520, y: 382 }, { x: 503, y: 438 }, { x: 555, y: 438 }] },
  Spleen: { kind: "polygon", points: [{ x: 260, y: 478 }, { x: 382, y: 535 }, { x: 260, y: 596 }] },
  "Solar Plexus": { kind: "polygon", points: [{ x: 640, y: 478 }, { x: 518, y: 535 }, { x: 640, y: 596 }] },
  Sacral: { kind: "rect", x: 410, y: 510, width: 80, height: 90, rx: 4 },
  Root: { kind: "rect", x: 402, y: 680, width: 96, height: 100, rx: 4 },
};

const CENTER_LABELS: Record<CenterId, Point> = {
  Head: { x: 450, y: 88 },
  Ajna: { x: 450, y: 184 },
  Throat: { x: 450, y: 296 },
  G: { x: 450, y: 409 },
  Ego: { x: 529, y: 416 },
  Spleen: { x: 310, y: 538 },
  "Solar Plexus": { x: 590, y: 538 },
  Sacral: { x: 450, y: 557 },
  Root: { x: 450, y: 735 },
};

const BODY_SYMBOL: Record<string, string> = {
  Sun: "☉", Earth: "⊕", Moon: "☽", NorthNode: "☊", SouthNode: "☋",
  Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄",
  Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

/*
 * Canonical gate anchors.
 * Labels are placed on the visible center boundary and every channel uses
 * exactly the same anchor.  Dense runs are ordered to match the reference,
 * especially Spleen 48/57/44/50, Solar 36/22/37/6 and Root top gates.
 */
const GATE_PORTS: Record<number, Point> = {
  // Head / Ajna
  64: { x: 422, y: 124 }, 61: { x: 450, y: 124 }, 63: { x: 478, y: 124 },
  47: { x: 422, y: 150 }, 24: { x: 450, y: 150 }, 4: { x: 478, y: 150 },
  17: { x: 420, y: 202 }, 43: { x: 450, y: 224 }, 11: { x: 480, y: 202 },

  // Throat
  62: { x: 424, y: 255 }, 23: { x: 450, y: 255 }, 56: { x: 476, y: 255 },
  16: { x: 407, y: 272 }, 20: { x: 407, y: 311 },
  45: { x: 493, y: 270 }, 12: { x: 493, y: 294 }, 35: { x: 493, y: 319 },
  31: { x: 424, y: 337 }, 8: { x: 450, y: 337 }, 33: { x: 476, y: 337 },

  // G center
  7: { x: 450, y: 362 },
  1: { x: 426, y: 384 }, 13: { x: 474, y: 384 },
  10: { x: 405, y: 405 }, 25: { x: 495, y: 405 },
  2: { x: 426, y: 428 }, 46: { x: 474, y: 428 },
  15: { x: 450, y: 450 },

  // Ego
  21: { x: 516, y: 396 }, 51: { x: 507, y: 422 },
  26: { x: 515, y: 438 }, 40: { x: 544, y: 438 },

  // Spleen: top-to-bottom on inner/right boundary, then lower edge outward.
  48: { x: 360, y: 525 },
  57: { x: 371, y: 531 },
  44: { x: 371, y: 541 },
  50: { x: 360, y: 549 },
  32: { x: 337, y: 559 },
  18: { x: 300, y: 577 },
  28: { x: 266, y: 593 },

  // Solar Plexus: mirrored reference order on inner/left boundary.
  36: { x: 540, y: 525 },
  22: { x: 529, y: 531 },
  37: { x: 529, y: 541 },
  6: { x: 540, y: 549 },
  49: { x: 563, y: 559 },
  55: { x: 600, y: 577 },
  30: { x: 634, y: 593 },

  // Sacral
  5: { x: 426, y: 510 }, 14: { x: 450, y: 510 }, 29: { x: 474, y: 510 },
  34: { x: 410, y: 531 }, 27: { x: 410, y: 555 }, 59: { x: 410, y: 579 },
  3: { x: 426, y: 600 }, 9: { x: 450, y: 600 }, 42: { x: 474, y: 600 },

  // Root: seven gates distributed clearly along the top edge, then 39/41 right.
  54: { x: 410, y: 680 }, 58: { x: 423, y: 680 }, 38: { x: 436, y: 680 },
  60: { x: 450, y: 680 }, 52: { x: 464, y: 680 }, 53: { x: 477, y: 680 }, 19: { x: 490, y: 680 },
  39: { x: 498, y: 716 }, 41: { x: 498, y: 758 },
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

function lerp(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function midpoint(a: Point, b: Point): Point {
  return lerp(a, b, 0.5);
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
  if (source === "personality") {
    return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#15151d" strokeWidth="5.8" strokeLinecap="butt" />;
  }
  if (source === "design") {
    return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#d94a40" strokeWidth="5.8" strokeLinecap="butt" />;
  }
  const [a1, b1] = offsetSegment(a, b, -1.8);
  const [a2, b2] = offsetSegment(a, b, 1.8);
  return <g>
    <line x1={a1.x} y1={a1.y} x2={b1.x} y2={b1.y} stroke="#15151d" strokeWidth="2.8" strokeLinecap="butt" />
    <line x1={a2.x} y1={a2.y} x2={b2.x} y2={b2.y} stroke="#d94a40" strokeWidth="2.8" strokeLinecap="butt" />
  </g>;
}

function renderCenter(center: CenterId, defined: boolean) {
  const shape = CENTER_SHAPES[center];
  const fill = defined ? CENTER_FILL[center] : "#ffffff";
  const common = { fill, stroke: "#171720", strokeWidth: 3 };
  if (shape.kind === "rect") {
    return <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={shape.rx} {...common} />;
  }
  return <polygon points={shape.points.map((p) => `${p.x},${p.y}`).join(" ")} {...common} />;
}

function gateTextColor(source: GateSource) {
  if (source === "design") return "#d94a40";
  if (source === "personality") return "#171720";
  if (source === "both") return "#8b2730";
  return "#5e5a54";
}

function GateBadge({ gate, source }: { gate: number; source: GateSource }) {
  const p = GATE_PORTS[gate];
  if (!p) return null;
  return <g>
    <circle cx={p.x} cy={p.y} r="6.4" fill="#fbfaf7" opacity="0.98" />
    <text x={p.x} y={p.y + 3} textAnchor="middle" fontSize="8.5" fontWeight="900" fill={gateTextColor(source)}>{gate}</text>
  </g>;
}

function ActivationPanel({ x, title, color, activations, align }: { x: number; title: string; color: string; activations: HumanDesignActivation[]; align: "left" | "right" }) {
  const rowH = 30;
  const startY = 86;
  return <g>
    <text x={x} y="50" textAnchor={align === "left" ? "start" : "end"} fontSize="18" fontWeight="800" fill={color}>{title}</text>
    {activations.map((a, i) => {
      const y = startY + i * rowH;
      return <g key={`${title}-${a.body}`}>
        <text x={x} y={y} textAnchor={align === "left" ? "start" : "end"} fontSize="17" fontWeight="700" fill={color}>{BODY_SYMBOL[a.body] ?? "•"}</text>
        <text x={x + (align === "left" ? 24 : -24)} y={y} textAnchor={align === "left" ? "start" : "end"} fontSize="14" fontWeight="700" fill="#252433">{a.gate}.{a.line}</text>
      </g>;
    })}
  </g>;
}

export function BodyGraph({ chart, personalityActivations = [], designActivations = [], width = 900 }: Props) {
  const defined = new Set(chart.centers);
  const activeChannels = new Set(chart.channels);
  const personalityGates = new Set(personalityActivations.map((a) => a.gate));
  const designGates = new Set(designActivations.map((a) => a.gate));

  return <svg viewBox="0 0 900 835" width="100%" style={{ maxWidth: width, height: "auto" }} role="img" aria-label="Human Design BodyGraph">
    <rect x="0" y="0" width="900" height="835" rx="24" fill="#fbfaf7" />
    <ActivationPanel x={34} title="Design" color="#d84238" activations={designActivations} align="left" />
    <ActivationPanel x={866} title="Personality" color="#191820" activations={personalityActivations} align="right" />

    {/* Background channel rails.  R3.0 deliberately restores visible rails;
        they are light gray but no longer disappear on mobile screens. */}
    <g>
      {CHANNELS.map((channel) => {
        const a = GATE_PORTS[channel.gateA];
        const b = GATE_PORTS[channel.gateB];
        if (!a || !b) return null;
        const id = canonicalChannelId(channel.gateA, channel.gateB);
        return <line key={`rail-${id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#aaa69f" strokeWidth="2" opacity="0.72" />;
      })}
    </g>

    {/* Active channels sit above the rails. Complete channels meet at midpoint;
        hanging gates intentionally stop early so they remain visually distinct. */}
    <g>
      {CHANNELS.map((channel) => {
        const a = GATE_PORTS[channel.gateA];
        const b = GATE_PORTS[channel.gateB];
        if (!a || !b) return null;
        const id = canonicalChannelId(channel.gateA, channel.gateB);
        const complete = activeChannels.has(id);
        const sourceA = sourceForGate(channel.gateA, personalityGates, designGates);
        const sourceB = sourceForGate(channel.gateB, personalityGates, designGates);
        if (complete) {
          const mid = midpoint(a, b);
          return <g key={`active-${id}`}>
            <ColoredLine a={a} b={mid} source={sourceA} />
            <ColoredLine a={b} b={mid} source={sourceB} />
          </g>;
        }
        return <g key={`active-${id}`}>
          <ColoredLine a={a} b={lerp(a, b, 0.25)} source={sourceA} />
          <ColoredLine a={b} b={lerp(b, a, 0.25)} source={sourceB} />
        </g>;
      })}
    </g>

    {/* Centers cover line interiors; gate labels render last and therefore remain legible. */}
    <g>
      {(Object.keys(CENTER_SHAPES) as CenterId[]).map((center) => <g key={center}>
        {renderCenter(center, defined.has(center))}
        <text x={CENTER_LABELS[center].x} y={CENTER_LABELS[center].y + 5} textAnchor="middle" fontSize="15" fontWeight="800" fill="#191820">{center === "Solar Plexus" ? "Solar" : center}</text>
      </g>)}
    </g>

    <g>
      {Object.keys(GATE_PORTS).map((gateString) => {
        const gate = Number(gateString);
        const source = sourceForGate(gate, personalityGates, designGates);
        return <GateBadge key={`gate-${gate}`} gate={gate} source={source} />;
      })}
    </g>

    <g transform="translate(450 814)">
      <rect x="-245" y="-22" width="490" height="32" rx="16" fill="#ffffff" stroke="#ddd8cf" />
      <text x="0" y="-2" textAnchor="middle" fontSize="14" fontWeight="700" fill="#5a5650">{chart.type} · {chart.authority} · {chart.profile} · {chart.definition}</text>
    </g>
  </svg>;
}
