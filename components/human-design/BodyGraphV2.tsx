"use client";

import type { HumanDesignActivation } from "@/lib/human-design/activations";
import { CHANNELS, type CenterId, type CoreHumanDesignChart } from "@/lib/human-design/topology";

export const BODYGRAPH_RENDERER_VERSION = "R8.0";

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
 * R8.0: compact reference geometry.
 * The previous renderer was still using an elongated/wide graph skeleton.
 * This version moves the nine centers into the same relative footprint as the
 * supplied reference: compact vertical core, small Ego, Spleen/Solar closer to
 * the central stack, and a much shorter Root distance. Gate ports are authored
 * independently per center edge; channels are direct gate-to-gate rails.
 */
const SHAPES: Record<CenterId, Shape> = {
  Head: { kind: "polygon", points: [{ x: 450, y: 48 }, { x: 408, y: 124 }, { x: 492, y: 124 }] },
  Ajna: { kind: "polygon", points: [{ x: 408, y: 146 }, { x: 492, y: 146 }, { x: 450, y: 212 }] },
  Throat: { kind: "rect", x: 411, y: 238, width: 78, height: 78, rx: 4 },
  G: { kind: "polygon", points: [{ x: 450, y: 338 }, { x: 489, y: 377 }, { x: 450, y: 416 }, { x: 411, y: 377 }] },
  Ego: { kind: "polygon", points: [{ x: 518, y: 350 }, { x: 499, y: 405 }, { x: 548, y: 405 }] },
  Spleen: { kind: "polygon", points: [{ x: 300, y: 430 }, { x: 392, y: 480 }, { x: 300, y: 531 }] },
  "Solar Plexus": { kind: "polygon", points: [{ x: 600, y: 430 }, { x: 508, y: 480 }, { x: 600, y: 531 }] },
  Sacral: { kind: "rect", x: 408, y: 468, width: 84, height: 80, rx: 4 },
  Root: { kind: "rect", x: 402, y: 586, width: 96, height: 82, rx: 4 },
};

const CENTER_LABEL: Record<CenterId, Point> = {
  Head: { x: 450, y: 88 },
  Ajna: { x: 450, y: 177 },
  Throat: { x: 450, y: 278 },
  G: { x: 450, y: 382 },
  Ego: { x: 526, y: 385 },
  Spleen: { x: 337, y: 484 },
  "Solar Plexus": { x: 563, y: 484 },
  Sacral: { x: 450, y: 511 },
  Root: { x: 450, y: 630 },
};

/* Exact channel endpoints on center borders. */
const PORT: Record<number, Point> = {
  // Head
  64: { x: 422, y: 124 }, 61: { x: 450, y: 124 }, 63: { x: 478, y: 124 },

  // Ajna
  47: { x: 422, y: 146 }, 24: { x: 450, y: 146 }, 4: { x: 478, y: 146 },
  17: { x: 424, y: 179 }, 43: { x: 450, y: 212 }, 11: { x: 476, y: 179 },

  // Throat
  62: { x: 427, y: 238 }, 23: { x: 450, y: 238 }, 56: { x: 473, y: 238 },
  16: { x: 411, y: 255 }, 20: { x: 411, y: 296 },
  45: { x: 489, y: 255 }, 12: { x: 489, y: 276 }, 35: { x: 489, y: 298 },
  31: { x: 427, y: 316 }, 8: { x: 450, y: 316 }, 33: { x: 473, y: 316 },

  // G
  7: { x: 450, y: 338 }, 1: { x: 431, y: 357 }, 13: { x: 469, y: 357 },
  10: { x: 411, y: 377 }, 25: { x: 489, y: 377 },
  2: { x: 431, y: 397 }, 46: { x: 469, y: 397 }, 15: { x: 450, y: 416 },

  // Ego
  21: { x: 512, y: 367 }, 51: { x: 503, y: 387 }, 26: { x: 505, y: 405 }, 40: { x: 540, y: 405 },

  // Spleen. Inner apex is 57; remaining gates spread along the two edges.
  48: { x: 350, y: 457 }, 57: { x: 392, y: 480 }, 44: { x: 371, y: 492 },
  50: { x: 350, y: 503 }, 32: { x: 332, y: 513 }, 18: { x: 315, y: 522 }, 28: { x: 301, y: 530 },

  // Solar Plexus mirrors Spleen.
  36: { x: 550, y: 457 }, 22: { x: 508, y: 480 }, 37: { x: 529, y: 492 },
  6: { x: 550, y: 503 }, 49: { x: 568, y: 513 }, 55: { x: 585, y: 522 }, 30: { x: 599, y: 530 },

  // Sacral
  5: { x: 427, y: 468 }, 14: { x: 450, y: 468 }, 29: { x: 473, y: 468 },
  34: { x: 408, y: 486 }, 27: { x: 408, y: 508 }, 59: { x: 408, y: 530 },
  3: { x: 427, y: 548 }, 9: { x: 450, y: 548 }, 42: { x: 473, y: 548 },

  // Root
  54: { x: 410, y: 586 }, 58: { x: 423, y: 586 }, 38: { x: 436, y: 586 },
  60: { x: 449, y: 586 }, 52: { x: 462, y: 586 }, 53: { x: 475, y: 586 }, 19: { x: 488, y: 586 },
  39: { x: 498, y: 620 }, 41: { x: 498, y: 650 },
};

/* Gate text is inset from the border, never placed on the rail itself. */
const GATE_LABEL: Record<number, Point> = {
  64: { x: 422, y: 118 }, 61: { x: 450, y: 118 }, 63: { x: 478, y: 118 },
  47: { x: 422, y: 152 }, 24: { x: 450, y: 152 }, 4: { x: 478, y: 152 },
  17: { x: 430, y: 178 }, 43: { x: 450, y: 204 }, 11: { x: 470, y: 178 },

  62: { x: 427, y: 246 }, 23: { x: 450, y: 246 }, 56: { x: 473, y: 246 },
  16: { x: 418, y: 257 }, 20: { x: 418, y: 296 },
  45: { x: 482, y: 257 }, 12: { x: 482, y: 276 }, 35: { x: 482, y: 296 },
  31: { x: 427, y: 308 }, 8: { x: 450, y: 308 }, 33: { x: 473, y: 308 },

  7: { x: 450, y: 346 }, 1: { x: 436, y: 361 }, 13: { x: 464, y: 361 },
  10: { x: 420, y: 377 }, 25: { x: 480, y: 377 },
  2: { x: 436, y: 393 }, 46: { x: 464, y: 393 }, 15: { x: 450, y: 408 },

  21: { x: 516, y: 370 }, 51: { x: 510, y: 387 }, 26: { x: 514, y: 398 }, 40: { x: 536, y: 398 },

  48: { x: 345, y: 454 }, 57: { x: 383, y: 480 }, 44: { x: 363, y: 489 },
  50: { x: 343, y: 499 }, 32: { x: 326, y: 509 }, 18: { x: 311, y: 518 }, 28: { x: 306, y: 524 },

  36: { x: 555, y: 454 }, 22: { x: 517, y: 480 }, 37: { x: 537, y: 489 },
  6: { x: 557, y: 499 }, 49: { x: 574, y: 509 }, 55: { x: 589, y: 518 }, 30: { x: 594, y: 524 },

  5: { x: 427, y: 476 }, 14: { x: 450, y: 476 }, 29: { x: 473, y: 476 },
  34: { x: 416, y: 488 }, 27: { x: 416, y: 508 }, 59: { x: 416, y: 528 },
  3: { x: 427, y: 540 }, 9: { x: 450, y: 540 }, 42: { x: 473, y: 540 },

  54: { x: 410, y: 594 }, 58: { x: 423, y: 594 }, 38: { x: 436, y: 594 },
  60: { x: 449, y: 594 }, 52: { x: 462, y: 594 }, 53: { x: 475, y: 594 }, 19: { x: 488, y: 594 },
  39: { x: 490, y: 620 }, 41: { x: 490, y: 650 },
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
  const fill = source === "design" ? "#d34a42" : source === "both" ? "#9c3933" : source === "personality" ? "#171720" : "#5f5b56";
  return (
    <text
      x={p.x}
      y={p.y + 3.2}
      textAnchor="middle"
      fontSize="8.8"
      fontWeight="900"
      fill={fill}
      paintOrder="stroke"
      stroke="#fbfaf7"
      strokeWidth="2.5"
    >
      {gate}
    </text>
  );
}

function ActiveSegment({ a, b, source }: { a: Point; b: Point; source: GateSource }) {
  if (source === "inactive") return null;
  if (source === "both") {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const ox = (-dy / len) * 1.8;
    const oy = (dx / len) * 1.8;
    return (
      <g>
        <line x1={a.x + ox} y1={a.y + oy} x2={b.x + ox} y2={b.y + oy} stroke="#171720" strokeWidth="3.5" />
        <line x1={a.x - ox} y1={a.y - oy} x2={b.x - ox} y2={b.y - oy} stroke="#d34a42" strokeWidth="3.5" />
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
      strokeWidth="6.2"
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

      {/* Straight reference rails, rendered below centers. */}
      <g opacity="0.76">
        {CHANNELS.map((c) => {
          const a = PORT[c.gateA];
          const b = PORT[c.gateB];
          if (!a || !b) return null;
          return <line key={`rail-${c.id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#a7a39d" strokeWidth="2.15" />;
        })}
      </g>

      {/* Active channels and short hanging gates. */}
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
          const fraction = 0.17;
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

      {/* Centers mask rail interiors, so every channel terminates at the edge. */}
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

      {/* Gate numbers are rendered last and remain pinned to their own center edge. */}
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
