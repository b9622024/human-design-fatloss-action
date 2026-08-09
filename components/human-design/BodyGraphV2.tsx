"use client";

import type { HumanDesignActivation } from "@/lib/human-design/activations";
import { CHANNELS, type CenterId, type CoreHumanDesignChart } from "@/lib/human-design/topology";

export const BODYGRAPH_RENDERER_VERSION = "GEOMETRY-2.0";

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
  Head: "#f2df68",
  Ajna: "#8cb9a6",
  Throat: "#b18d61",
  G: "#f0df69",
  Ego: "#ffffff",
  Spleen: "#ffffff",
  "Solar Plexus": "#ffffff",
  Sacral: "#ce6963",
  Root: "#b98762",
};

/*
 * Geometry 2.0
 *
 * This renderer no longer derives gate placement from a generic center box.
 * Every center and every gate port is authored against one fixed reference
 * coordinate system. Channel rails use those ports, while labels are inset
 * independently so dense gates can remain readable without moving the rail.
 */
const SHAPES: Record<CenterId, Shape> = {
  Head: { kind: "polygon", points: [{ x: 450, y: 55 }, { x: 405, y: 132 }, { x: 495, y: 132 }] },
  Ajna: { kind: "polygon", points: [{ x: 405, y: 154 }, { x: 495, y: 154 }, { x: 450, y: 225 }] },
  Throat: { kind: "rect", x: 405, y: 250, width: 90, height: 84, rx: 4 },
  G: { kind: "polygon", points: [{ x: 450, y: 352 }, { x: 492, y: 394 }, { x: 450, y: 436 }, { x: 408, y: 394 }] },
  Ego: { kind: "polygon", points: [{ x: 525, y: 365 }, { x: 505, y: 420 }, { x: 555, y: 420 }] },
  Spleen: { kind: "polygon", points: [{ x: 285, y: 432 }, { x: 395, y: 492 }, { x: 285, y: 552 }] },
  "Solar Plexus": { kind: "polygon", points: [{ x: 615, y: 432 }, { x: 505, y: 492 }, { x: 615, y: 552 }] },
  Sacral: { kind: "rect", x: 405, y: 468, width: 90, height: 92, rx: 4 },
  Root: { kind: "rect", x: 385, y: 590, width: 130, height: 88, rx: 4 },
};

const CENTER_LABEL: Record<CenterId, Point> = {
  Head: { x: 450, y: 96 },
  Ajna: { x: 450, y: 190 },
  Throat: { x: 450, y: 294 },
  G: { x: 450, y: 400 },
  Ego: { x: 532, y: 399 },
  Spleen: { x: 330, y: 498 },
  "Solar Plexus": { x: 570, y: 498 },
  Sacral: { x: 450, y: 518 },
  Root: { x: 450, y: 640 },
};

/* Exact rail endpoints on the visible center boundary. */
const PORT: Record<number, Point> = {
  // Head bottom edge
  64: { x: 420, y: 132 }, 61: { x: 450, y: 132 }, 63: { x: 480, y: 132 },

  // Ajna top, sides, apex
  47: { x: 420, y: 154 }, 24: { x: 450, y: 154 }, 4: { x: 480, y: 154 },
  17: { x: 420, y: 178 }, 43: { x: 450, y: 225 }, 11: { x: 480, y: 178 },

  // Throat perimeter
  62: { x: 423, y: 250 }, 23: { x: 450, y: 250 }, 56: { x: 477, y: 250 },
  16: { x: 405, y: 268 }, 20: { x: 405, y: 312 },
  45: { x: 495, y: 268 }, 12: { x: 495, y: 290 }, 35: { x: 495, y: 312 },
  31: { x: 423, y: 334 }, 8: { x: 450, y: 334 }, 33: { x: 477, y: 334 },

  // G perimeter
  7: { x: 450, y: 352 }, 1: { x: 429, y: 373 }, 13: { x: 471, y: 373 },
  10: { x: 408, y: 394 }, 25: { x: 492, y: 394 },
  2: { x: 429, y: 415 }, 46: { x: 471, y: 415 }, 15: { x: 450, y: 436 },

  // Ego perimeter
  21: { x: 520, y: 379 }, 51: { x: 511, y: 400 }, 26: { x: 510, y: 420 }, 40: { x: 548, y: 420 },

  // Spleen: inner point and gates spread down the lower edge
  48: { x: 365, y: 476 }, 57: { x: 395, y: 492 }, 44: { x: 376, y: 502 },
  50: { x: 356, y: 513 }, 32: { x: 335, y: 525 }, 18: { x: 313, y: 537 }, 28: { x: 287, y: 551 },

  // Solar Plexus mirrors the Spleen geometry
  36: { x: 535, y: 476 }, 22: { x: 505, y: 492 }, 37: { x: 524, y: 502 },
  6: { x: 544, y: 513 }, 49: { x: 565, y: 525 }, 55: { x: 587, y: 537 }, 30: { x: 613, y: 551 },

  // Sacral perimeter
  5: { x: 423, y: 468 }, 14: { x: 450, y: 468 }, 29: { x: 477, y: 468 },
  34: { x: 405, y: 488 }, 27: { x: 405, y: 514 }, 59: { x: 405, y: 540 },
  3: { x: 423, y: 560 }, 9: { x: 450, y: 560 }, 42: { x: 477, y: 560 },

  // Root: seven top gates evenly distributed, two right-side gates
  54: { x: 395, y: 590 }, 58: { x: 413, y: 590 }, 38: { x: 431, y: 590 },
  60: { x: 450, y: 590 }, 52: { x: 469, y: 590 }, 53: { x: 487, y: 590 }, 19: { x: 505, y: 590 },
  39: { x: 515, y: 625 }, 41: { x: 515, y: 660 },
};

/* Label anchors are separate from channel endpoints. */
const GATE_LABEL: Record<number, Point> = {
  64: { x: 420, y: 125 }, 61: { x: 450, y: 125 }, 63: { x: 480, y: 125 },
  47: { x: 420, y: 162 }, 24: { x: 450, y: 162 }, 4: { x: 480, y: 162 },
  17: { x: 427, y: 180 }, 43: { x: 450, y: 216 }, 11: { x: 473, y: 180 },

  62: { x: 423, y: 258 }, 23: { x: 450, y: 258 }, 56: { x: 477, y: 258 },
  16: { x: 413, y: 269 }, 20: { x: 413, y: 312 },
  45: { x: 487, y: 269 }, 12: { x: 487, y: 290 }, 35: { x: 487, y: 311 },
  31: { x: 423, y: 326 }, 8: { x: 450, y: 326 }, 33: { x: 477, y: 326 },

  7: { x: 450, y: 360 }, 1: { x: 435, y: 377 }, 13: { x: 465, y: 377 },
  10: { x: 418, y: 394 }, 25: { x: 482, y: 394 },
  2: { x: 435, y: 411 }, 46: { x: 465, y: 411 }, 15: { x: 450, y: 427 },

  21: { x: 522, y: 381 }, 51: { x: 518, y: 400 }, 26: { x: 517, y: 412 }, 40: { x: 541, y: 412 },

  48: { x: 358, y: 472 }, 57: { x: 385, y: 492 }, 44: { x: 366, y: 498 },
  50: { x: 347, y: 508 }, 32: { x: 328, y: 520 }, 18: { x: 307, y: 532 }, 28: { x: 294, y: 544 },

  36: { x: 542, y: 472 }, 22: { x: 515, y: 492 }, 37: { x: 534, y: 498 },
  6: { x: 553, y: 508 }, 49: { x: 572, y: 520 }, 55: { x: 593, y: 532 }, 30: { x: 606, y: 544 },

  5: { x: 423, y: 477 }, 14: { x: 450, y: 477 }, 29: { x: 477, y: 477 },
  34: { x: 414, y: 490 }, 27: { x: 414, y: 514 }, 59: { x: 414, y: 538 },
  3: { x: 423, y: 551 }, 9: { x: 450, y: 551 }, 42: { x: 477, y: 551 },

  54: { x: 395, y: 599 }, 58: { x: 413, y: 599 }, 38: { x: 431, y: 599 },
  60: { x: 450, y: 599 }, 52: { x: 469, y: 599 }, 53: { x: 487, y: 599 }, 19: { x: 505, y: 599 },
  39: { x: 506, y: 625 }, 41: { x: 506, y: 660 },
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

function renderCenter(center: CenterId, defined: boolean) {
  const s = SHAPES[center];
  const common = { fill: defined ? CENTER_FILL[center] : "#fff", stroke: "#171720", strokeWidth: 3.1 };
  if (s.kind === "rect") {
    return <rect x={s.x} y={s.y} width={s.width} height={s.height} rx={s.rx} {...common} />;
  }
  return <polygon points={s.points.map((p) => `${p.x},${p.y}`).join(" ")} {...common} />;
}

function GateLabel({ gate, source }: { gate: number; source: GateSource }) {
  const p = GATE_LABEL[gate];
  if (!p) return null;
  const fill = source === "design" ? "#d34a42" : source === "both" ? "#9c3933" : source === "personality" ? "#171720" : "#625f5a";
  return (
    <g>
      <circle cx={p.x} cy={p.y} r="7.6" fill="#fbfaf7" opacity="0.96" />
      <text
        x={p.x}
        y={p.y + 3.2}
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="900"
        fill={fill}
      >
        {gate}
      </text>
    </g>
  );
}

function ActiveSegment({ a, b, source }: { a: Point; b: Point; source: GateSource }) {
  if (source === "inactive") return null;
  if (source === "both") {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const ox = (-dy / len) * 1.7;
    const oy = (dx / len) * 1.7;
    return (
      <g>
        <line x1={a.x + ox} y1={a.y + oy} x2={b.x + ox} y2={b.y + oy} stroke="#171720" strokeWidth="3.4" strokeLinecap="butt" />
        <line x1={a.x - ox} y1={a.y - oy} x2={b.x - ox} y2={b.y - oy} stroke="#d34a42" strokeWidth="3.4" strokeLinecap="butt" />
      </g>
    );
  }
  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={source === "design" ? "#d34a42" : "#171720"}
      strokeWidth="6"
      strokeLinecap="butt"
    />
  );
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
  return (
    <g>
      <text x={x} y="44" textAnchor={align === "left" ? "start" : "end"} fontSize="17" fontWeight="800" fill={color}>{title}</text>
      {activations.map((a, i) => {
        const y = 72 + i * 26;
        return (
          <g key={`${title}-${a.body}`}>
            <text x={x} y={y} textAnchor={align === "left" ? "start" : "end"} fontSize="15" fontWeight="700" fill={color}>{BODY_SYMBOL[a.body] ?? "•"}</text>
            <text x={x + (align === "left" ? 22 : -22)} y={y} textAnchor={align === "left" ? "start" : "end"} fontSize="13" fontWeight="700" fill="#24232e">{a.gate}.{a.line}</text>
          </g>
        );
      })}
    </g>
  );
}

export function BodyGraph({ chart, personalityActivations = [], designActivations = [], width = 900 }: Props) {
  const defined = new Set(chart.centers);
  const activeChannels = new Set(
    chart.channels.map((id) => {
      const [a, b] = id.split("-").map(Number);
      return canonical(a, b);
    }),
  );
  const personality = new Set(personalityActivations.map((a) => a.gate));
  const design = new Set(designActivations.map((a) => a.gate));

  return (
    <svg viewBox="0 0 900 720" width="100%" style={{ maxWidth: width, height: "auto" }} role="img" aria-label="Human Design BodyGraph">
      <rect width="900" height="720" rx="24" fill="#fbfaf7" />
      <ActivationPanel x={34} title="Design" color="#d84238" activations={designActivations} align="left" />
      <ActivationPanel x={866} title="Personality" color="#191820" activations={personalityActivations} align="right" />

      {/* Every channel gets a white outer rail and a darker inner rail. This keeps intersections legible. */}
      <g>
        {CHANNELS.map((c) => {
          const a = PORT[c.gateA];
          const b = PORT[c.gateB];
          if (!a || !b) return null;
          return (
            <g key={`rail-${c.id}`}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#ffffff" strokeWidth="7.2" />
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#a7a39d" strokeWidth="2.1" />
            </g>
          );
        })}
      </g>

      {/* Active channels and hanging gates. */}
      <g>
        {CHANNELS.map((c) => {
          const a = PORT[c.gateA];
          const b = PORT[c.gateB];
          if (!a || !b) return null;
          const id = canonical(c.gateA, c.gateB);
          const sa = gateSource(c.gateA, personality, design);
          const sb = gateSource(c.gateB, personality, design);

          if (activeChannels.has(id)) {
            const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
            return (
              <g key={`active-${id}`}>
                <ActiveSegment a={a} b={mid} source={sa} />
                <ActiveSegment a={b} b={mid} source={sb} />
              </g>
            );
          }

          const fraction = 0.16;
          const aEnd = { x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction };
          const bEnd = { x: b.x + (a.x - b.x) * fraction, y: b.y + (a.y - b.y) * fraction };
          return (
            <g key={`hanging-${id}`}>
              <ActiveSegment a={a} b={aEnd} source={sa} />
              <ActiveSegment a={b} b={bEnd} source={sb} />
            </g>
          );
        })}
      </g>

      {/* Centers mask rail interiors so channels visually terminate on the boundary. */}
      <g>
        {(Object.keys(SHAPES) as CenterId[]).map((center) => (
          <g key={center}>
            {renderCenter(center, defined.has(center))}
            <text x={CENTER_LABEL[center].x} y={CENTER_LABEL[center].y + 5} textAnchor="middle" fontSize="15.5" fontWeight="800" fill="#191820">
              {center === "Solar Plexus" ? "Solar" : center}
            </text>
          </g>
        ))}
      </g>

      {/* Gate labels are drawn last and have their own anchors, independent of channel ports. */}
      <g>
        {Object.keys(GATE_LABEL).map((gateText) => {
          const gate = Number(gateText);
          return <GateLabel key={gate} gate={gate} source={gateSource(gate, personality, design)} />;
        })}
      </g>

      <g transform="translate(450 696)">
        <rect x="-245" y="-20" width="490" height="30" rx="15" fill="#fff" stroke="#ddd8cf" />
        <text x="0" y="0" textAnchor="middle" fontSize="13.5" fontWeight="700" fill="#5a5650">{chart.type} · {chart.authority} · {chart.profile} · {chart.definition}</text>
      </g>
    </svg>
  );
}
