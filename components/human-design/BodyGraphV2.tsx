"use client";

import type { HumanDesignActivation } from "@/lib/human-design/activations";
import { CHANNELS, type CenterId, type CoreHumanDesignChart } from "@/lib/human-design/topology";

export const BODYGRAPH_RENDERER_VERSION = "R2.0";

type Props = {
  chart: CoreHumanDesignChart;
  personalityActivations?: HumanDesignActivation[];
  designActivations?: HumanDesignActivation[];
  width?: number;
};

type Point = { x: number; y: number };
type GateSource = "personality" | "design" | "both" | "inactive";
type PolygonShape = { kind: "polygon"; points: Point[] };
type RectShape = { kind: "rect"; x: number; y: number; width: number; height: number; rx: number };
type Shape = PolygonShape | RectShape;

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

// Renderer 2.0 uses a fixed canonical BodyGraph scaffold. Gate coordinates are
// derived from center edges, so labels and channel endpoints share the same source.
const CENTER_SHAPES: Record<CenterId, Shape> = {
  Head: { kind: "polygon", points: [{ x: 450, y: 54 }, { x: 410, y: 132 }, { x: 490, y: 132 }] },
  Ajna: { kind: "polygon", points: [{ x: 410, y: 164 }, { x: 490, y: 164 }, { x: 450, y: 238 }] },
  Throat: { kind: "rect", x: 410, y: 270, width: 80, height: 88, rx: 5 },
  G: { kind: "polygon", points: [{ x: 450, y: 392 }, { x: 500, y: 440 }, { x: 450, y: 490 }, { x: 400, y: 440 }] },
  Ego: { kind: "polygon", points: [{ x: 535, y: 414 }, { x: 510, y: 474 }, { x: 565, y: 474 }] },
  Spleen: { kind: "polygon", points: [{ x: 245, y: 520 }, { x: 355, y: 610 }, { x: 245, y: 690 }] },
  "Solar Plexus": { kind: "polygon", points: [{ x: 655, y: 520 }, { x: 545, y: 610 }, { x: 655, y: 690 }] },
  Sacral: { kind: "rect", x: 405, y: 585, width: 90, height: 104, rx: 8 },
  Root: { kind: "rect", x: 390, y: 770, width: 120, height: 104, rx: 8 },
};

const CENTER_LABELS: Record<CenterId, Point> = {
  Head: { x: 450, y: 94 },
  Ajna: { x: 450, y: 196 },
  Throat: { x: 450, y: 316 },
  G: { x: 450, y: 444 },
  Ego: { x: 538, y: 450 },
  Spleen: { x: 286, y: 610 },
  "Solar Plexus": { x: 614, y: 610 },
  Sacral: { x: 450, y: 640 },
  Root: { x: 450, y: 830 },
};

const BODY_SYMBOL: Record<string, string> = {
  Sun: "☉", Earth: "⊕", Moon: "☽", NorthNode: "☊", SouthNode: "☋",
  Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄",
  Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

function lerpPoint(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function spreadOnEdge(target: Record<number, Point>, gates: number[], a: Point, b: Point, start = 0.14, end = 0.86) {
  if (gates.length === 1) {
    target[gates[0]] = lerpPoint(a, b, (start + end) / 2);
    return;
  }
  gates.forEach((gate, index) => {
    const t = start + (end - start) * (index / (gates.length - 1));
    target[gate] = lerpPoint(a, b, t);
  });
}

function buildGatePorts(): Record<number, Point> {
  const p: Record<number, Point> = {};

  // Head / Ajna vertical crown.
  spreadOnEdge(p, [64, 61, 63], { x: 410, y: 132 }, { x: 490, y: 132 }, 0.18, 0.82);
  spreadOnEdge(p, [47, 24, 4], { x: 410, y: 164 }, { x: 490, y: 164 }, 0.18, 0.82);
  p[17] = lerpPoint({ x: 410, y: 164 }, { x: 450, y: 238 }, 0.72);
  p[43] = { x: 450, y: 238 };
  p[11] = lerpPoint({ x: 490, y: 164 }, { x: 450, y: 238 }, 0.72);

  // Throat.
  spreadOnEdge(p, [62, 23, 56], { x: 410, y: 270 }, { x: 490, y: 270 }, 0.16, 0.84);
  spreadOnEdge(p, [16, 20], { x: 410, y: 274 }, { x: 410, y: 352 }, 0.20, 0.78);
  spreadOnEdge(p, [45, 12, 35], { x: 490, y: 274 }, { x: 490, y: 352 }, 0.14, 0.86);
  spreadOnEdge(p, [31, 8, 33], { x: 410, y: 358 }, { x: 490, y: 358 }, 0.18, 0.82);

  // G center.
  p[7] = { x: 450, y: 392 };
  p[1] = lerpPoint({ x: 450, y: 392 }, { x: 400, y: 440 }, 0.50);
  p[13] = lerpPoint({ x: 450, y: 392 }, { x: 500, y: 440 }, 0.50);
  p[10] = { x: 400, y: 440 };
  p[25] = { x: 500, y: 440 };
  p[2] = lerpPoint({ x: 400, y: 440 }, { x: 450, y: 490 }, 0.56);
  p[15] = { x: 450, y: 490 };
  p[46] = lerpPoint({ x: 500, y: 440 }, { x: 450, y: 490 }, 0.56);

  // Ego triangle.
  p[21] = lerpPoint({ x: 535, y: 414 }, { x: 510, y: 474 }, 0.30);
  p[51] = lerpPoint({ x: 535, y: 414 }, { x: 510, y: 474 }, 0.70);
  p[26] = lerpPoint({ x: 510, y: 474 }, { x: 565, y: 474 }, 0.25);
  p[40] = lerpPoint({ x: 510, y: 474 }, { x: 565, y: 474 }, 0.82);

  // Spleen: inner point split into upper and lower rails, matching classic layouts.
  const spleenTop = { x: 245, y: 520 };
  const spleenInner = { x: 355, y: 610 };
  const spleenBottom = { x: 245, y: 690 };
  spreadOnEdge(p, [48, 57], spleenTop, spleenInner, 0.70, 0.90);
  spreadOnEdge(p, [44, 50], spleenInner, spleenBottom, 0.10, 0.32);
  spreadOnEdge(p, [32, 18, 28], spleenInner, spleenBottom, 0.48, 0.92);

  // Solar Plexus mirrors Spleen.
  const solarTop = { x: 655, y: 520 };
  const solarInner = { x: 545, y: 610 };
  const solarBottom = { x: 655, y: 690 };
  spreadOnEdge(p, [36, 22], solarTop, solarInner, 0.70, 0.90);
  spreadOnEdge(p, [37, 6], solarInner, solarBottom, 0.10, 0.32);
  spreadOnEdge(p, [49, 55, 30], solarInner, solarBottom, 0.48, 0.92);

  // Sacral.
  spreadOnEdge(p, [5, 14, 29], { x: 405, y: 585 }, { x: 495, y: 585 }, 0.16, 0.84);
  spreadOnEdge(p, [34, 27, 59], { x: 405, y: 588 }, { x: 405, y: 686 }, 0.14, 0.86);
  spreadOnEdge(p, [3, 9, 42], { x: 405, y: 689 }, { x: 495, y: 689 }, 0.16, 0.84);

  // Root. Seven upper gates are truly evenly distributed across the top edge.
  spreadOnEdge(p, [54, 58, 38, 60, 52, 53, 19], { x: 390, y: 770 }, { x: 510, y: 770 }, 0.07, 0.93);
  spreadOnEdge(p, [39, 41], { x: 510, y: 778 }, { x: 510, y: 866 }, 0.28, 0.76);

  return p;
}

const GATE_PORTS = buildGatePorts();

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

function channelStub(a: Point, b: Point, fraction = 0.30): Point {
  return lerpPoint(a, b, fraction);
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
  if (source === "personality") return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#171720" strokeWidth="5.4" strokeLinecap="butt" />;
  if (source === "design") return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#d94a40" strokeWidth="5.4" strokeLinecap="butt" />;
  const [a1, b1] = offsetSegment(a, b, -1.7);
  const [a2, b2] = offsetSegment(a, b, 1.7);
  return <g>
    <line x1={a1.x} y1={a1.y} x2={b1.x} y2={b1.y} stroke="#171720" strokeWidth="2.5" strokeLinecap="butt" />
    <line x1={a2.x} y1={a2.y} x2={b2.x} y2={b2.y} stroke="#d94a40" strokeWidth="2.5" strokeLinecap="butt" />
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
  return "#66615a";
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

    {/* All channel rails are drawn first. They remain single straight gate-to-gate segments. */}
    <g>
      {CHANNELS.map((channel) => {
        const a = GATE_PORTS[channel.gateA];
        const b = GATE_PORTS[channel.gateB];
        if (!a || !b) return null;
        const id = canonicalChannelId(channel.gateA, channel.gateB);
        return <line key={`rail-${id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#d8d5cf" strokeWidth="2" opacity="0.72" />;
      })}
    </g>

    {/* Active layers are drawn above rails but below center shapes to reduce visual collisions. */}
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
          <ColoredLine a={a} b={channelStub(a, b)} source={sourceA} />
          <ColoredLine a={b} b={channelStub(b, a)} source={sourceB} />
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
