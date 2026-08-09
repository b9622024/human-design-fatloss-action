"use client";

import type { HumanDesignActivation } from "@/lib/human-design/activations";
import { CHANNELS, type CenterId, type CoreHumanDesignChart } from "@/lib/human-design/topology";

export const BODYGRAPH_RENDERER_VERSION = "R4.0";

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

type ChannelGeometry = { a: Point; b: Point };

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
 * R4.0 architecture
 * -----------------
 * Gate labels and channel endpoints are intentionally decoupled.
 * The label can sit exactly on the visible center boundary while the channel
 * endpoint can occupy its own lane.  This prevents dense labels from forcing
 * channels into the same pixel coordinates.
 */
const CENTER_SHAPES: Record<CenterId, Shape> = {
  Head: { kind: "polygon", points: [{ x: 450, y: 54 }, { x: 408, y: 126 }, { x: 492, y: 126 }] },
  Ajna: { kind: "polygon", points: [{ x: 408, y: 150 }, { x: 492, y: 150 }, { x: 450, y: 220 }] },
  Throat: { kind: "rect", x: 408, y: 252, width: 84, height: 82, rx: 4 },
  G: { kind: "polygon", points: [{ x: 450, y: 358 }, { x: 493, y: 400 }, { x: 450, y: 444 }, { x: 407, y: 400 }] },
  Ego: { kind: "polygon", points: [{ x: 512, y: 374 }, { x: 497, y: 430 }, { x: 548, y: 430 }] },
  Spleen: { kind: "polygon", points: [{ x: 310, y: 500 }, { x: 397, y: 553 }, { x: 310, y: 606 }] },
  "Solar Plexus": { kind: "polygon", points: [{ x: 590, y: 500 }, { x: 503, y: 553 }, { x: 590, y: 606 }] },
  Sacral: { kind: "rect", x: 409, y: 518, width: 82, height: 90, rx: 4 },
  Root: { kind: "rect", x: 400, y: 680, width: 100, height: 104, rx: 4 },
};

const CENTER_LABELS: Record<CenterId, Point> = {
  Head: { x: 450, y: 90 },
  Ajna: { x: 450, y: 184 },
  Throat: { x: 450, y: 294 },
  G: { x: 450, y: 404 },
  Ego: { x: 522, y: 408 },
  Spleen: { x: 344, y: 557 },
  "Solar Plexus": { x: 556, y: 557 },
  Sacral: { x: 450, y: 563 },
  Root: { x: 450, y: 738 },
};

const BODY_SYMBOL: Record<string, string> = {
  Sun: "☉", Earth: "⊕", Moon: "☽", NorthNode: "☊", SouthNode: "☋",
  Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄",
  Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

/* Visible gate label positions only. */
const GATE_LABEL_POSITIONS: Record<number, Point> = {
  64: { x: 422, y: 126 }, 61: { x: 450, y: 126 }, 63: { x: 478, y: 126 },
  47: { x: 422, y: 150 }, 24: { x: 450, y: 150 }, 4: { x: 478, y: 150 },
  17: { x: 421, y: 200 }, 43: { x: 450, y: 220 }, 11: { x: 479, y: 200 },

  62: { x: 424, y: 252 }, 23: { x: 450, y: 252 }, 56: { x: 476, y: 252 },
  16: { x: 408, y: 270 }, 20: { x: 408, y: 309 },
  45: { x: 492, y: 269 }, 12: { x: 492, y: 293 }, 35: { x: 492, y: 318 },
  31: { x: 424, y: 334 }, 8: { x: 450, y: 334 }, 33: { x: 476, y: 334 },

  7: { x: 450, y: 358 }, 1: { x: 426, y: 381 }, 13: { x: 474, y: 381 },
  10: { x: 407, y: 400 }, 25: { x: 493, y: 400 },
  2: { x: 426, y: 423 }, 46: { x: 474, y: 423 }, 15: { x: 450, y: 444 },

  21: { x: 510, y: 387 }, 51: { x: 500, y: 414 }, 26: { x: 512, y: 430 }, 40: { x: 540, y: 430 },

  // Spleen labels: deliberately spaced on the triangle edge, matching the reference order.
  48: { x: 388, y: 548 }, 57: { x: 379, y: 554 }, 44: { x: 370, y: 560 },
  50: { x: 360, y: 566 }, 32: { x: 346, y: 576 }, 18: { x: 328, y: 588 }, 28: { x: 313, y: 602 },

  // Solar labels mirror Spleen and stay on their own triangle edge.
  36: { x: 512, y: 548 }, 22: { x: 521, y: 554 }, 37: { x: 530, y: 560 },
  6: { x: 540, y: 566 }, 49: { x: 554, y: 576 }, 55: { x: 572, y: 588 }, 30: { x: 587, y: 602 },

  5: { x: 426, y: 518 }, 14: { x: 450, y: 518 }, 29: { x: 474, y: 518 },
  34: { x: 409, y: 539 }, 27: { x: 409, y: 563 }, 59: { x: 409, y: 587 },
  3: { x: 426, y: 608 }, 9: { x: 450, y: 608 }, 42: { x: 474, y: 608 },

  // Root labels: evenly distributed and readable on the top boundary.
  54: { x: 407, y: 680 }, 58: { x: 421, y: 680 }, 38: { x: 435, y: 680 },
  60: { x: 450, y: 680 }, 52: { x: 465, y: 680 }, 53: { x: 479, y: 680 }, 19: { x: 493, y: 680 },
  39: { x: 500, y: 718 }, 41: { x: 500, y: 760 },
};

/*
 * Channel-only endpoint geometry.
 * These are NOT the label coordinates. Each channel owns a separate straight
 * lane, which is the key architectural change in R4.0.
 */
const CHANNEL_GEOMETRY: Record<string, ChannelGeometry> = {
  "47-64": { a: { x: 424, y: 126 }, b: { x: 424, y: 150 } },
  "24-61": { a: { x: 450, y: 126 }, b: { x: 450, y: 150 } },
  "4-63": { a: { x: 476, y: 126 }, b: { x: 476, y: 150 } },

  "17-62": { a: { x: 420, y: 200 }, b: { x: 424, y: 252 } },
  "23-43": { a: { x: 450, y: 220 }, b: { x: 450, y: 252 } },
  "11-56": { a: { x: 480, y: 200 }, b: { x: 476, y: 252 } },

  "16-48": { a: { x: 408, y: 272 }, b: { x: 386, y: 546 } },
  "20-57": { a: { x: 408, y: 301 }, b: { x: 378, y: 552 } },
  "10-20": { a: { x: 408, y: 314 }, b: { x: 409, y: 398 } },
  "20-34": { a: { x: 411, y: 314 }, b: { x: 412, y: 539 } },
  "12-22": { a: { x: 492, y: 292 }, b: { x: 522, y: 552 } },
  "35-36": { a: { x: 492, y: 319 }, b: { x: 514, y: 546 } },
  "21-45": { a: { x: 492, y: 270 }, b: { x: 510, y: 387 } },

  "7-31": { a: { x: 424, y: 334 }, b: { x: 446, y: 358 } },
  "1-8": { a: { x: 450, y: 334 }, b: { x: 428, y: 381 } },
  "13-33": { a: { x: 476, y: 334 }, b: { x: 472, y: 381 } },

  "2-14": { a: { x: 426, y: 423 }, b: { x: 445, y: 518 } },
  "5-15": { a: { x: 450, y: 444 }, b: { x: 430, y: 518 } },
  "29-46": { a: { x: 474, y: 423 }, b: { x: 474, y: 518 } },
  "10-34": { a: { x: 409, y: 400 }, b: { x: 412, y: 541 } },
  "34-57": { a: { x: 412, y: 541 }, b: { x: 378, y: 554 } },
  "27-50": { a: { x: 412, y: 563 }, b: { x: 360, y: 566 } },

  // Left lower lanes: ordered left-to-right to avoid crossing each other.
  "32-54": { a: { x: 346, y: 576 }, b: { x: 407, y: 680 } },
  "18-58": { a: { x: 328, y: 588 }, b: { x: 421, y: 680 } },
  "28-38": { a: { x: 313, y: 602 }, b: { x: 435, y: 680 } },

  // Central lower lanes are parallel.
  "3-60": { a: { x: 426, y: 608 }, b: { x: 450, y: 680 } },
  "9-52": { a: { x: 450, y: 608 }, b: { x: 465, y: 680 } },
  "42-53": { a: { x: 474, y: 608 }, b: { x: 479, y: 680 } },

  // Right lower lanes mirror the left side.
  "19-49": { a: { x: 493, y: 680 }, b: { x: 554, y: 576 } },
  "39-55": { a: { x: 500, y: 718 }, b: { x: 572, y: 588 } },
  "30-41": { a: { x: 500, y: 760 }, b: { x: 587, y: 602 } },

  "25-51": { a: { x: 493, y: 400 }, b: { x: 500, y: 414 } },
  "26-44": { a: { x: 512, y: 430 }, b: { x: 370, y: 560 } },
  "37-40": { a: { x: 540, y: 430 }, b: { x: 530, y: 560 } },
  "10-57": { a: { x: 407, y: 400 }, b: { x: 379, y: 554 } },
  "6-59": { a: { x: 409, y: 587 }, b: { x: 540, y: 566 } },
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
  if (source === "personality") {
    return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#15151d" strokeWidth="6" strokeLinecap="butt" />;
  }
  if (source === "design") {
    return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#d94a40" strokeWidth="6" strokeLinecap="butt" />;
  }
  const [a1, b1] = offsetSegment(a, b, -1.7);
  const [a2, b2] = offsetSegment(a, b, 1.7);
  return <g>
    <line x1={a1.x} y1={a1.y} x2={b1.x} y2={b1.y} stroke="#15151d" strokeWidth="3" strokeLinecap="butt" />
    <line x1={a2.x} y1={a2.y} x2={b2.x} y2={b2.y} stroke="#d94a40" strokeWidth="3" strokeLinecap="butt" />
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
  const p = GATE_LABEL_POSITIONS[gate];
  if (!p) return null;
  return <g>
    <circle cx={p.x} cy={p.y} r="6.1" fill="#fbfaf7" opacity="0.98" />
    <text x={p.x} y={p.y + 3} textAnchor="middle" fontSize="8.2" fontWeight="900" fill={gateTextColor(source)}>{gate}</text>
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

    {/* Background rails are intentionally visible. Every channel gets its own endpoint lane. */}
    <g>
      {CHANNELS.map((channel) => {
        const id = canonicalChannelId(channel.gateA, channel.gateB);
        const geometry = CHANNEL_GEOMETRY[id];
        if (!geometry) return null;
        return <line key={`rail-${id}`} x1={geometry.a.x} y1={geometry.a.y} x2={geometry.b.x} y2={geometry.b.y} stroke="#8d8982" strokeWidth="2.25" opacity="0.62" />;
      })}
    </g>

    {/* Active channels use their own independent geometry; labels never influence routing. */}
    <g>
      {CHANNELS.map((channel) => {
        const id = canonicalChannelId(channel.gateA, channel.gateB);
        const geometry = CHANNEL_GEOMETRY[id];
        if (!geometry) return null;
        const complete = activeChannels.has(id);
        const sourceA = sourceForGate(channel.gateA, personalityGates, designGates);
        const sourceB = sourceForGate(channel.gateB, personalityGates, designGates);
        if (complete) {
          const mid = midpoint(geometry.a, geometry.b);
          return <g key={`active-${id}`}>
            <ColoredLine a={geometry.a} b={mid} source={sourceA} />
            <ColoredLine a={geometry.b} b={mid} source={sourceB} />
          </g>;
        }
        return <g key={`active-${id}`}>
          <ColoredLine a={geometry.a} b={lerp(geometry.a, geometry.b, 0.24)} source={sourceA} />
          <ColoredLine a={geometry.b} b={lerp(geometry.b, geometry.a, 0.24)} source={sourceB} />
        </g>;
      })}
    </g>

    {/* Centers cover channel interiors. */}
    <g>
      {(Object.keys(CENTER_SHAPES) as CenterId[]).map((center) => <g key={center}>
        {renderCenter(center, defined.has(center))}
        <text x={CENTER_LABELS[center].x} y={CENTER_LABELS[center].y + 5} textAnchor="middle" fontSize="15" fontWeight="800" fill="#191820">{center === "Solar Plexus" ? "Solar" : center}</text>
      </g>)}
    </g>

    {/* Gate labels render last and use their own boundary coordinates. */}
    <g>
      {Object.keys(GATE_LABEL_POSITIONS).map((gateString) => {
        const gate = Number(gateString);
        return <GateBadge key={`gate-${gate}`} gate={gate} source={sourceForGate(gate, personalityGates, designGates)} />;
      })}
    </g>

    <g transform="translate(450 814)">
      <rect x="-245" y="-22" width="490" height="32" rx="16" fill="#ffffff" stroke="#ddd8cf" />
      <text x="0" y="-2" textAnchor="middle" fontSize="14" fontWeight="700" fill="#5a5650">{chart.type} · {chart.authority} · {chart.profile} · {chart.definition}</text>
    </g>
  </svg>;
}
