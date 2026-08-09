"use client";

import type { HumanDesignActivation } from "@/lib/human-design/activations";
import { CHANNELS, type CenterId, type CoreHumanDesignChart } from "@/lib/human-design/topology";

export const BODYGRAPH_RENDERER_VERSION = "R2.1";

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
  Ego: "#ffffff",
  Spleen: "#ffffff",
  "Solar Plexus": "#ffffff",
  Sacral: "#cf635d",
  Root: "#b6825d",
};

/*
 * R2.1: fixed canonical scaffold, tuned from the reference proportions.
 * The two side triangles are pushed outward, Ego stays tight to G, and all
 * channel endpoints are literal center-boundary ports.  Port ordering is chosen
 * to minimise crossings instead of simply following numeric gate order.
 */
const CENTER_SHAPES: Record<CenterId, Shape> = {
  Head: { kind: "polygon", points: [{ x: 450, y: 48 }, { x: 405, y: 128 }, { x: 495, y: 128 }] },
  Ajna: { kind: "polygon", points: [{ x: 405, y: 158 }, { x: 495, y: 158 }, { x: 450, y: 238 }] },
  Throat: { kind: "rect", x: 402, y: 268, width: 96, height: 92, rx: 6 },
  G: { kind: "polygon", points: [{ x: 450, y: 392 }, { x: 502, y: 442 }, { x: 450, y: 494 }, { x: 398, y: 442 }] },
  Ego: { kind: "polygon", points: [{ x: 528, y: 414 }, { x: 510, y: 474 }, { x: 566, y: 474 }] },
  Spleen: { kind: "polygon", points: [{ x: 160, y: 526 }, { x: 352, y: 610 }, { x: 160, y: 698 }] },
  "Solar Plexus": { kind: "polygon", points: [{ x: 740, y: 526 }, { x: 548, y: 610 }, { x: 740, y: 698 }] },
  Sacral: { kind: "rect", x: 402, y: 584, width: 96, height: 108, rx: 9 },
  Root: { kind: "rect", x: 382, y: 770, width: 136, height: 108, rx: 9 },
};

const CENTER_LABELS: Record<CenterId, Point> = {
  Head: { x: 450, y: 90 },
  Ajna: { x: 450, y: 194 },
  Throat: { x: 450, y: 314 },
  G: { x: 450, y: 444 },
  Ego: { x: 538, y: 451 },
  Spleen: { x: 235, y: 613 },
  "Solar Plexus": { x: 665, y: 613 },
  Sacral: { x: 450, y: 641 },
  Root: { x: 450, y: 832 },
};

const BODY_SYMBOL: Record<string, string> = {
  Sun: "☉", Earth: "⊕", Moon: "☽", NorthNode: "☊", SouthNode: "☋",
  Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄",
  Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

/*
 * Canonical gate ports.  These are intentionally explicit.  The renderer no
 * longer interpolates the dense gate clusters because that was the source of
 * the repeated spacing/crossing regressions in V11-V15/R2.0.
 */
const GATE_PORTS: Record<number, Point> = {
  64: { x: 420, y: 128 }, 61: { x: 450, y: 128 }, 63: { x: 480, y: 128 },
  47: { x: 420, y: 158 }, 24: { x: 450, y: 158 }, 4: { x: 480, y: 158 },
  17: { x: 420, y: 208 }, 43: { x: 450, y: 238 }, 11: { x: 480, y: 208 },

  62: { x: 423, y: 268 }, 23: { x: 450, y: 268 }, 56: { x: 477, y: 268 },
  16: { x: 402, y: 288 }, 20: { x: 402, y: 333 },
  45: { x: 498, y: 286 }, 12: { x: 498, y: 312 }, 35: { x: 498, y: 338 },
  31: { x: 423, y: 360 }, 8: { x: 450, y: 360 }, 33: { x: 477, y: 360 },

  7: { x: 450, y: 392 }, 1: { x: 424, y: 417 }, 13: { x: 476, y: 417 },
  10: { x: 398, y: 442 }, 25: { x: 502, y: 442 },
  2: { x: 424, y: 468 }, 15: { x: 450, y: 494 }, 46: { x: 476, y: 468 },

  21: { x: 522, y: 434 }, 51: { x: 514, y: 459 }, 26: { x: 524, y: 474 }, 40: { x: 554, y: 474 },

  /* Spleen: inner gates separated vertically; root gates fan left-to-right. */
  48: { x: 330, y: 600 },
  57: { x: 349, y: 610 },
  44: { x: 340, y: 622 },
  50: { x: 320, y: 638 },
  32: { x: 296, y: 650 },
  18: { x: 248, y: 672 },
  28: { x: 196, y: 694 },

  /* Solar Plexus mirrors Spleen. */
  36: { x: 570, y: 600 },
  22: { x: 551, y: 610 },
  37: { x: 560, y: 622 },
  6: { x: 580, y: 638 },
  49: { x: 604, y: 650 },
  55: { x: 652, y: 672 },
  30: { x: 704, y: 694 },

  /* Sacral top order is arranged by partner position to keep G↔Sacral lanes parallel. */
  14: { x: 426, y: 584 }, 5: { x: 450, y: 584 }, 29: { x: 474, y: 584 },
  34: { x: 402, y: 606 }, 27: { x: 402, y: 638 }, 59: { x: 402, y: 670 },
  3: { x: 426, y: 692 }, 9: { x: 450, y: 692 }, 42: { x: 474, y: 692 },

  /* Root top is crossing-minimised: Spleen lanes, then Sacral lanes, then Solar. */
  38: { x: 394, y: 770 }, 58: { x: 410, y: 770 }, 54: { x: 426, y: 770 },
  60: { x: 450, y: 770 }, 52: { x: 470, y: 770 }, 53: { x: 490, y: 770 }, 19: { x: 506, y: 770 },
  39: { x: 518, y: 808 }, 41: { x: 518, y: 852 },
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
  if (source === "personality") return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#171720" strokeWidth="5.2" strokeLinecap="butt" />;
  if (source === "design") return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#d94a40" strokeWidth="5.2" strokeLinecap="butt" />;
  const [a1, b1] = offsetSegment(a, b, -1.7);
  const [a2, b2] = offsetSegment(a, b, 1.7);
  return <g>
    <line x1={a1.x} y1={a1.y} x2={b1.x} y2={b1.y} stroke="#171720" strokeWidth="2.4" strokeLinecap="butt" />
    <line x1={a2.x} y1={a2.y} x2={b2.x} y2={b2.y} stroke="#d94a40" strokeWidth="2.4" strokeLinecap="butt" />
  </g>;
}

function renderCenter(center: CenterId, defined: boolean) {
  const shape = CENTER_SHAPES[center];
  const fill = defined ? CENTER_FILL[center] : "#ffffff";
  const common = { fill, stroke: "#171720", strokeWidth: 3 };
  if (shape.kind === "rect") return <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={shape.rx} {...common} />;
  return <polygon points={shape.points.map((p) => `${p.x},${p.y}`).join(" ")} {...common} />;
}

function gateTextColor(source: GateSource) {
  if (source === "design") return "#d94a40";
  if (source === "personality") return "#171720";
  if (source === "both") return "#8b2730";
  return "#67625b";
}

function GateBadge({ gate, source }: { gate: number; source: GateSource }) {
  const p = GATE_PORTS[gate];
  if (!p) return null;
  return <g>
    <circle cx={p.x} cy={p.y} r="7" fill="#fbfaf7" opacity="0.99" />
    <text x={p.x} y={p.y + 3.1} textAnchor="middle" fontSize="9" fontWeight="900" fill={gateTextColor(source)}>{gate}</text>
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

  return <svg viewBox="0 0 900 920" width="100%" style={{ maxWidth: width, height: "auto" }} role="img" aria-label="Human Design BodyGraph">
    <rect x="0" y="0" width="900" height="920" rx="24" fill="#fbfaf7" />
    <ActivationPanel x={34} title="Design" color="#d84238" activations={designActivations} align="left" />
    <ActivationPanel x={866} title="Personality" color="#191820" activations={personalityActivations} align="right" />

    {/* Background topology: deliberately very light so crossings do not dominate. */}
    <g>
      {CHANNELS.map((channel) => {
        const a = GATE_PORTS[channel.gateA];
        const b = GATE_PORTS[channel.gateB];
        if (!a || !b) return null;
        const id = canonicalChannelId(channel.gateA, channel.gateB);
        return <line key={`rail-${id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#cfcac2" strokeWidth="1.35" opacity="0.34" />;
      })}
    </g>

    {/* Active channel layer. Complete channels use the full straight segment;
        hanging gates stop at 28% of the channel length. */}
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
          <ColoredLine a={a} b={lerp(a, b, 0.28)} source={sourceA} />
          <ColoredLine a={b} b={lerp(b, a, 0.28)} source={sourceB} />
        </g>;
      })}
    </g>

    {/* Centers cover channel interiors; gates are rendered last on the boundaries. */}
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

    <g transform="translate(450 898)">
      <rect x="-245" y="-22" width="490" height="32" rx="16" fill="#ffffff" stroke="#ddd8cf" />
      <text x="0" y="-2" textAnchor="middle" fontSize="14" fontWeight="700" fill="#5a5650">{chart.type} · {chart.authority} · {chart.profile} · {chart.definition}</text>
    </g>
  </svg>;
}
