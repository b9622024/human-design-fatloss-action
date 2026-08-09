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

const CENTER_LABELS: Record<CenterId, Point> = {
  Head: { x: 450, y: 80 },
  Ajna: { x: 450, y: 188 },
  Throat: { x: 450, y: 310 },
  G: { x: 450, y: 438 },
  Ego: { x: 548, y: 457 },
  Spleen: { x: 220, y: 579 },
  "Solar Plexus": { x: 680, y: 579 },
  Sacral: { x: 450, y: 611 },
  Root: { x: 450, y: 757 },
};

/*
 * V9 uses one geometry source of truth for BOTH the visible center shapes and
 * their gate ports. A gate port is derived from an actual polygon edge or rect
 * border, so a gate label can no longer drift away from the shape boundary.
 */
const CENTER_SHAPES: Record<CenterId, Shape> = {
  Head: {
    kind: "polygon",
    points: [
      { x: 450, y: 38 },
      { x: 390, y: 118 },
      { x: 510, y: 118 },
    ],
  },
  Ajna: {
    kind: "polygon",
    points: [
      { x: 390, y: 152 },
      { x: 510, y: 152 },
      { x: 450, y: 228 },
    ],
  },
  Throat: { kind: "rect", x: 390, y: 270, width: 120, height: 82, rx: 7 },
  G: {
    kind: "polygon",
    points: [
      { x: 450, y: 388 },
      { x: 505, y: 438 },
      { x: 450, y: 492 },
      { x: 395, y: 438 },
    ],
  },
  Ego: {
    kind: "polygon",
    points: [
      { x: 548, y: 413 },
      { x: 512, y: 486 },
      { x: 584, y: 486 },
    ],
  },
  Spleen: {
    kind: "polygon",
    points: [
      { x: 115, y: 515 },
      { x: 330, y: 575 },
      { x: 115, y: 650 },
    ],
  },
  "Solar Plexus": {
    kind: "polygon",
    points: [
      { x: 785, y: 515 },
      { x: 570, y: 575 },
      { x: 785, y: 650 },
    ],
  },
  Sacral: { kind: "rect", x: 390, y: 570, width: 120, height: 84, rx: 10 },
  Root: { kind: "rect", x: 385, y: 710, width: 130, height: 92, rx: 10 },
};

const BODY_SYMBOL: Record<string, string> = {
  Sun: "☉",
  Earth: "⊕",
  Moon: "☽",
  NorthNode: "☊",
  SouthNode: "☋",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
};

function edgePoint(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function polygonPort(center: CenterId, edgeIndex: number, t: number): Point {
  const shape = CENTER_SHAPES[center];
  if (shape.kind !== "polygon") throw new Error(`${center} is not a polygon`);
  const a = shape.points[edgeIndex];
  const b = shape.points[(edgeIndex + 1) % shape.points.length];
  return edgePoint(a, b, t);
}

function rectPort(center: CenterId, side: "top" | "right" | "bottom" | "left", t: number): Point {
  const shape = CENTER_SHAPES[center];
  if (shape.kind !== "rect") throw new Error(`${center} is not a rect`);
  const { x, y, width, height } = shape;
  if (side === "top") return { x: x + width * t, y };
  if (side === "right") return { x: x + width, y: y + height * t };
  if (side === "bottom") return { x: x + width * t, y: y + height };
  return { x, y: y + height * t };
}

/*
 * Gate placement follows the visible center perimeter.
 * Polygon edgeIndex follows each shape's point order above.
 */
const GATE_PORTS: Record<number, Point> = {
  // Head: bottom edge (edge 1: left-bottom -> right-bottom)
  64: polygonPort("Head", 1, 0.20),
  61: polygonPort("Head", 1, 0.50),
  63: polygonPort("Head", 1, 0.80),

  // Ajna: top edge + two lower sloped edges
  47: polygonPort("Ajna", 0, 0.20),
  24: polygonPort("Ajna", 0, 0.50),
  4: polygonPort("Ajna", 0, 0.80),
  17: polygonPort("Ajna", 2, 0.68),
  43: { x: 450, y: 228 },
  11: polygonPort("Ajna", 1, 0.68),

  // Throat rectangle
  62: rectPort("Throat", "top", 0.20),
  23: rectPort("Throat", "top", 0.50),
  56: rectPort("Throat", "top", 0.80),
  16: rectPort("Throat", "left", 0.25),
  20: rectPort("Throat", "left", 0.67),
  45: rectPort("Throat", "right", 0.22),
  12: rectPort("Throat", "right", 0.50),
  35: rectPort("Throat", "right", 0.78),
  31: rectPort("Throat", "bottom", 0.20),
  8: rectPort("Throat", "bottom", 0.50),
  33: rectPort("Throat", "bottom", 0.80),

  // G diamond
  1: polygonPort("G", 3, 0.35),
  7: { x: 450, y: 388 },
  13: polygonPort("G", 0, 0.35),
  10: { x: 395, y: 438 },
  25: { x: 505, y: 438 },
  2: polygonPort("G", 2, 0.35),
  15: { x: 450, y: 492 },
  46: polygonPort("G", 1, 0.65),

  // Ego triangle, pulled close to G and all ports sit on its perimeter
  21: polygonPort("Ego", 0, 0.24),
  51: polygonPort("Ego", 0, 0.62),
  26: polygonPort("Ego", 1, 0.18),
  40: polygonPort("Ego", 1, 0.82),

  // Spleen triangle, farther left to open channel corridors
  48: polygonPort("Spleen", 0, 0.76),
  57: polygonPort("Spleen", 0, 0.91),
  44: { x: 330, y: 575 },
  50: polygonPort("Spleen", 1, 0.14),
  32: polygonPort("Spleen", 1, 0.46),
  18: polygonPort("Spleen", 1, 0.67),
  28: polygonPort("Spleen", 1, 0.84),

  // Solar Plexus mirror
  36: polygonPort("Solar Plexus", 0, 0.76),
  22: polygonPort("Solar Plexus", 0, 0.91),
  37: { x: 570, y: 575 },
  6: polygonPort("Solar Plexus", 1, 0.14),
  49: polygonPort("Solar Plexus", 1, 0.46),
  55: polygonPort("Solar Plexus", 1, 0.67),
  30: polygonPort("Solar Plexus", 1, 0.84),

  // Sacral rectangle
  5: rectPort("Sacral", "top", 0.20),
  14: rectPort("Sacral", "top", 0.50),
  29: rectPort("Sacral", "top", 0.80),
  34: rectPort("Sacral", "left", 0.22),
  27: rectPort("Sacral", "left", 0.50),
  59: rectPort("Sacral", "left", 0.78),
  3: rectPort("Sacral", "bottom", 0.20),
  9: rectPort("Sacral", "bottom", 0.50),
  42: rectPort("Sacral", "bottom", 0.80),

  // Root rectangle: seven gates on top, two on right edge
  54: rectPort("Root", "top", 0.08),
  58: rectPort("Root", "top", 0.20),
  38: rectPort("Root", "top", 0.33),
  60: rectPort("Root", "top", 0.46),
  52: rectPort("Root", "top", 0.59),
  53: rectPort("Root", "top", 0.72),
  19: rectPort("Root", "top", 0.88),
  39: rectPort("Root", "right", 0.38),
  41: rectPort("Root", "right", 0.72),
};

function renderCenter(center: CenterId, defined: boolean) {
  const shape = CENTER_SHAPES[center];
  const fill = defined ? CENTER_FILL[center] : "#ffffff";
  const stroke = "#252433";
  const strokeWidth = 2.8;

  if (shape.kind === "rect") {
    return (
      <rect
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        rx={shape.rx}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  return (
    <polygon
      points={shape.points.map((p) => `${p.x},${p.y}`).join(" ")}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
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

function StraightSegment({ a, b, source, width = 6.8 }: { a: Point; b: Point; source: GateSource; width?: number }) {
  const colors = sourceColors(source);
  if (!colors.length) return null;

  if (colors.length === 1) {
    return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={colors[0]} strokeWidth={width} strokeLinecap="butt" />;
  }

  const [a1, b1] = offsetSegment(a, b, -2.4);
  const [a2, b2] = offsetSegment(a, b, 2.4);
  return (
    <g>
      <line x1={a1.x} y1={a1.y} x2={b1.x} y2={b1.y} stroke={colors[0]} strokeWidth={3.3} strokeLinecap="butt" />
      <line x1={a2.x} y1={a2.y} x2={b2.x} y2={b2.y} stroke={colors[1]} strokeWidth={3.3} strokeLinecap="butt" />
    </g>
  );
}

function gateTextColor(source: GateSource) {
  if (source === "design") return "#d94a43";
  if (source === "personality") return "#24212d";
  if (source === "both") return "#7f2d37";
  return "#77736d";
}

function ActivationPanel({
  x,
  title,
  color,
  activations,
  align,
}: {
  x: number;
  title: string;
  color: string;
  activations: HumanDesignActivation[];
  align: "left" | "right";
}) {
  const rowH = 32;
  const startY = 95;

  return (
    <g>
      <text x={x} y="55" textAnchor={align === "left" ? "start" : "end"} fontSize="18" fontWeight="800" fill={color}>
        {title}
      </text>
      {activations.map((a, i) => {
        const y = startY + i * rowH;
        return (
          <g key={`${title}-${a.body}`}>
            <text x={x} y={y} textAnchor={align === "left" ? "start" : "end"} fontSize="20" fontWeight="700" fill={color}>
              {BODY_SYMBOL[a.body] ?? "•"}
            </text>
            <text
              x={x + (align === "left" ? 28 : -28)}
              y={y}
              textAnchor={align === "left" ? "start" : "end"}
              fontSize="15"
              fontWeight="700"
              fill="#252433"
            >
              {a.gate}.{a.line}
            </text>
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

  return (
    <svg viewBox="0 0 900 850" width={width} role="img" aria-label="Human Design BodyGraph">
      <rect x="0" y="0" width="900" height="850" rx="28" fill="#fbfaf7" />
      <ActivationPanel x={38} title="Design" color="#d94a43" activations={designActivations} align="left" />
      <ActivationPanel x={862} title="Personality" color="#24212d" activations={personalityActivations} align="right" />

      {/* Channel layer: all endpoints are exact gate ports derived from the center boundary. */}
      <g>
        {CHANNELS.map((channel) => {
          const id = canonicalChannelId(channel.gateA, channel.gateB);
          const a = GATE_PORTS[channel.gateA];
          const b = GATE_PORTS[channel.gateB];
          if (!a || !b) return null;

          const complete = activeChannels.has(id);
          const sourceA = sourceForGate(channel.gateA, personalityGates, designGates);
          const sourceB = sourceForGate(channel.gateB, personalityGates, designGates);
          const mid = lerp(a, b, 0.5);
          const stubA = lerp(a, b, 0.30);
          const stubB = lerp(b, a, 0.30);

          return (
            <g key={id}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#c7c3bb"
                strokeWidth="2.8"
                strokeOpacity="0.82"
                strokeLinecap="butt"
              />
              {complete ? (
                <>
                  {sourceA !== "inactive" && <StraightSegment a={a} b={mid} source={sourceA} width={7.0} />}
                  {sourceB !== "inactive" && <StraightSegment a={b} b={mid} source={sourceB} width={7.0} />}
                </>
              ) : (
                <>
                  {sourceA !== "inactive" && <StraightSegment a={a} b={stubA} source={sourceA} width={6.4} />}
                  {sourceB !== "inactive" && <StraightSegment a={b} b={stubB} source={sourceB} width={6.4} />}
                </>
              )}
            </g>
          );
        })}
      </g>

      {/* Center layer */}
      {(Object.keys(CENTER_SHAPES) as CenterId[]).map((center) => (
        <g key={center}>
          {renderCenter(center, defined.has(center))}
          <text
            x={CENTER_LABELS[center].x}
            y={CENTER_LABELS[center].y + 5}
            textAnchor="middle"
            fontSize="14"
            fontWeight="800"
            fill="#252433"
          >
            {center === "Solar Plexus" ? "Solar" : center}
          </text>
        </g>
      ))}

      {/* Gate labels are centered ON the exact boundary port. */}
      <g>
        {Object.entries(GATE_PORTS).map(([gateString, port]) => {
          const gate = Number(gateString);
          const source = sourceForGate(gate, personalityGates, designGates);
          return (
            <g key={`gate-${gate}`}>
              <circle cx={port.x} cy={port.y} r="8.5" fill="#fbfaf7" stroke="#e5e0d7" strokeWidth="0.8" />
              <text
                x={port.x}
                y={port.y + 3.2}
                textAnchor="middle"
                fontSize="9.4"
                fontWeight="900"
                fill={gateTextColor(source)}
              >
                {gate}
              </text>
            </g>
          );
        })}
      </g>

      <g transform="translate(450 826)">
        <rect x="-250" y="-24" width="500" height="34" rx="17" fill="#ffffff" stroke="#e3dfd7" />
        <text x="0" y="-2" textAnchor="middle" fontSize="14" fontWeight="700" fill="#5f5a54">
          {chart.type} · {chart.authority} · {chart.profile} · {chart.definition}
        </text>
      </g>
    </svg>
  );
}
