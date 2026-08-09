"use client";

import type { HumanDesignActivation } from "@/lib/human-design/activations";
import { CHANNELS, type CenterId, type CoreHumanDesignChart } from "@/lib/human-design/topology";

export const BODYGRAPH_RENDERER_VERSION = "R7.0";

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
  Head: "#f3df67",
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
 * R7.0 is a geometry rebuild rather than another coordinate nudge.
 *
 * 1. Channel endpoints (PORT) and gate-number positions (GATE_LABEL) are
 *    independent. Lines terminate on the center boundary; numbers sit just
 *    inside that same edge, so labels no longer get dragged into channel rails.
 * 2. Spleen / Solar are pushed farther outward and Ego is pulled inward.
 * 3. Root top gates are ordered by destination: left-side channels on the left,
 *    Sacral channels in the middle, Solar channels on the right.
 * 4. Every reference rail is still a single straight gate-to-gate segment.
 */
const SHAPES: Record<CenterId, Shape> = {
  Head: { kind: "polygon", points: [{ x: 450, y: 54 }, { x: 405, y: 132 }, { x: 495, y: 132 }] },
  Ajna: { kind: "polygon", points: [{ x: 405, y: 158 }, { x: 495, y: 158 }, { x: 450, y: 238 }] },
  Throat: { kind: "rect", x: 404, y: 278, width: 92, height: 92, rx: 5 },
  G: { kind: "polygon", points: [{ x: 450, y: 397 }, { x: 500, y: 447 }, { x: 450, y: 497 }, { x: 400, y: 447 }] },
  Ego: { kind: "polygon", points: [{ x: 525, y: 410 }, { x: 506, y: 468 }, { x: 558, y: 468 }] },
  Spleen: { kind: "polygon", points: [{ x: 212, y: 520 }, { x: 382, y: 590 }, { x: 212, y: 664 }] },
  "Solar Plexus": { kind: "polygon", points: [{ x: 688, y: 520 }, { x: 518, y: 590 }, { x: 688, y: 664 }] },
  Sacral: { kind: "rect", x: 397, y: 552, width: 106, height: 104, rx: 5 },
  Root: { kind: "rect", x: 382, y: 730, width: 136, height: 118, rx: 5 },
};

const CENTER_LABEL: Record<CenterId, Point> = {
  Head: { x: 450, y: 99 }, Ajna: { x: 450, y: 198 }, Throat: { x: 450, y: 325 },
  G: { x: 450, y: 452 }, Ego: { x: 532, y: 446 }, Spleen: { x: 285, y: 597 },
  "Solar Plexus": { x: 615, y: 597 }, Sacral: { x: 450, y: 609 }, Root: { x: 450, y: 792 },
};

/* Exact channel connection points on center borders. */
const PORT: Record<number, Point> = {
  64: { x: 421, y: 132 }, 61: { x: 450, y: 132 }, 63: { x: 479, y: 132 },
  47: { x: 421, y: 158 }, 24: { x: 450, y: 158 }, 4: { x: 479, y: 158 },
  17: { x: 422, y: 207 }, 43: { x: 450, y: 238 }, 11: { x: 478, y: 207 },

  62: { x: 422, y: 278 }, 23: { x: 450, y: 278 }, 56: { x: 478, y: 278 },
  16: { x: 404, y: 298 }, 20: { x: 404, y: 344 },
  45: { x: 496, y: 298 }, 12: { x: 496, y: 322 }, 35: { x: 496, y: 348 },
  31: { x: 422, y: 370 }, 8: { x: 450, y: 370 }, 33: { x: 478, y: 370 },

  7: { x: 450, y: 397 }, 1: { x: 425, y: 422 }, 13: { x: 475, y: 422 },
  10: { x: 400, y: 447 }, 25: { x: 500, y: 447 },
  2: { x: 425, y: 472 }, 46: { x: 475, y: 472 }, 15: { x: 450, y: 497 },

  21: { x: 519, y: 428 }, 51: { x: 510, y: 453 }, 26: { x: 512, y: 468 }, 40: { x: 549, y: 468 },

  /* Spleen: top-inner channels near apex, root channels fan across lower edge. */
  48: { x: 338, y: 572 },
  57: { x: 382, y: 590 },
  44: { x: 357, y: 601 },
  50: { x: 332, y: 612 },
  32: { x: 296, y: 628 },
  18: { x: 255, y: 646 },
  28: { x: 216, y: 663 },

  /* Solar mirrors Spleen. */
  36: { x: 562, y: 572 },
  22: { x: 518, y: 590 },
  37: { x: 543, y: 601 },
  6: { x: 568, y: 612 },
  49: { x: 604, y: 628 },
  55: { x: 645, y: 646 },
  30: { x: 684, y: 663 },

  5: { x: 423, y: 552 }, 14: { x: 450, y: 552 }, 29: { x: 477, y: 552 },
  34: { x: 397, y: 577 }, 27: { x: 397, y: 604 }, 59: { x: 397, y: 631 },
  3: { x: 423, y: 656 }, 9: { x: 450, y: 656 }, 42: { x: 477, y: 656 },

  54: { x: 392, y: 730 }, 58: { x: 411, y: 730 }, 38: { x: 430, y: 730 },
  60: { x: 449, y: 730 }, 52: { x: 468, y: 730 }, 53: { x: 487, y: 730 }, 19: { x: 506, y: 730 },
  39: { x: 518, y: 770 }, 41: { x: 518, y: 817 },
};

/* Gate text lives inside the center edge, not on top of the rail. */
const GATE_LABEL: Record<number, Point> = {
  64: { x: 421, y: 126 }, 61: { x: 450, y: 126 }, 63: { x: 479, y: 126 },
  47: { x: 421, y: 164 }, 24: { x: 450, y: 164 }, 4: { x: 479, y: 164 },
  17: { x: 429, y: 204 }, 43: { x: 450, y: 229 }, 11: { x: 471, y: 204 },

  62: { x: 422, y: 286 }, 23: { x: 450, y: 286 }, 56: { x: 478, y: 286 },
  16: { x: 411, y: 301 }, 20: { x: 411, y: 344 },
  45: { x: 489, y: 301 }, 12: { x: 489, y: 322 }, 35: { x: 489, y: 346 },
  31: { x: 422, y: 362 }, 8: { x: 450, y: 362 }, 33: { x: 478, y: 362 },

  7: { x: 450, y: 406 }, 1: { x: 431, y: 427 }, 13: { x: 469, y: 427 },
  10: { x: 409, y: 447 }, 25: { x: 491, y: 447 },
  2: { x: 431, y: 467 }, 46: { x: 469, y: 467 }, 15: { x: 450, y: 488 },

  21: { x: 523, y: 432 }, 51: { x: 517, y: 451 }, 26: { x: 520, y: 461 }, 40: { x: 545, y: 461 },

  48: { x: 333, y: 570 }, 57: { x: 373, y: 589 }, 44: { x: 350, y: 599 }, 50: { x: 326, y: 610 },
  32: { x: 292, y: 625 }, 18: { x: 253, y: 642 }, 28: { x: 221, y: 656 },

  36: { x: 567, y: 570 }, 22: { x: 527, y: 589 }, 37: { x: 550, y: 599 }, 6: { x: 574, y: 610 },
  49: { x: 608, y: 625 }, 55: { x: 647, y: 642 }, 30: { x: 679, y: 656 },

  5: { x: 423, y: 560 }, 14: { x: 450, y: 560 }, 29: { x: 477, y: 560 },
  34: { x: 405, y: 579 }, 27: { x: 405, y: 604 }, 59: { x: 405, y: 629 },
  3: { x: 423, y: 648 }, 9: { x: 450, y: 648 }, 42: { x: 477, y: 648 },

  54: { x: 392, y: 738 }, 58: { x: 411, y: 738 }, 38: { x: 430, y: 738 },
  60: { x: 449, y: 738 }, 52: { x: 468, y: 738 }, 53: { x: 487, y: 738 }, 19: { x: 506, y: 738 },
  39: { x: 510, y: 770 }, 41: { x: 510, y: 817 },
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
  if (s.kind === "rect") return <rect x={s.x} y={s.y} width={s.width} height={s.height} rx={s.rx} {...common} />;
  return <polygon points={s.points.map((p) => `${p.x},${p.y}`).join(" ")} {...common} />;
}

function GateLabel({ gate, source }: { gate: number; source: GateSource }) {
  const p = GATE_LABEL[gate];
  if (!p) return null;
  const fill = source === "design" ? "#d64b42" : source === "both" ? "#9b3832" : source === "personality" ? "#171720" : "#66615b";
  return <text x={p.x} y={p.y + 3.2} textAnchor="middle" fontSize="9.1" fontWeight="900" fill={fill} paintOrder="stroke" stroke="#fbfaf7" strokeWidth="3.8">{gate}</text>;
}

function ActiveSegment({ a, b, source }: { a: Point; b: Point; source: GateSource }) {
  if (source === "inactive") return null;
  if (source === "both") {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const ox = (-dy / len) * 2.2;
    const oy = (dx / len) * 2.2;
    return <g>
      <line x1={a.x + ox} y1={a.y + oy} x2={b.x + ox} y2={b.y + oy} stroke="#171720" strokeWidth="3.9" />
      <line x1={a.x - ox} y1={a.y - oy} x2={b.x - ox} y2={b.y - oy} stroke="#d64b42" strokeWidth="3.9" />
    </g>;
  }
  const stroke = source === "design" ? "#d64b42" : "#171720";
  return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke} strokeWidth="7" strokeLinecap="butt" />;
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

  return <svg viewBox="0 0 900 895" width="100%" style={{ maxWidth: width, height: "auto" }} role="img" aria-label="Human Design BodyGraph">
    <rect width="900" height="895" rx="24" fill="#fbfaf7" />
    <ActivationPanel x={34} title="Design" color="#d84238" activations={designActivations} align="left" />
    <ActivationPanel x={866} title="Personality" color="#191820" activations={personalityActivations} align="right" />

    {/* All reference rails remain straight, but are visible enough to read topology. */}
    <g opacity="0.68">
      {CHANNELS.map((c) => {
        const a = PORT[c.gateA];
        const b = PORT[c.gateB];
        if (!a || !b) return null;
        return <line key={`rail-${c.id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#aaa69f" strokeWidth="2.45" />;
      })}
    </g>

    {/* Active complete channels meet at a midpoint; hanging gates stop early. */}
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
        const fraction = 0.22;
        const aEnd = { x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction };
        const bEnd = { x: b.x + (a.x - b.x) * fraction, y: b.y + (a.y - b.y) * fraction };
        return <g key={`hanging-${id}`}>
          <ActiveSegment a={a} b={aEnd} source={sa} />
          <ActiveSegment a={b} b={bEnd} source={sb} />
        </g>;
      })}
    </g>

    {/* Centers cover rail interiors, making every channel visually terminate at the border. */}
    <g>
      {(Object.keys(SHAPES) as CenterId[]).map((center) => <g key={center}>
        {renderCenter(center, defined.has(center))}
        <text x={CENTER_LABEL[center].x} y={CENTER_LABEL[center].y + 5} textAnchor="middle" fontSize="16" fontWeight="800" fill="#191820">{center === "Solar Plexus" ? "Solar" : center}</text>
      </g>)}
    </g>

    <g>
      {Object.keys(GATE_LABEL).map((gateText) => {
        const gate = Number(gateText);
        return <GateLabel key={gate} gate={gate} source={gateSource(gate, personality, design)} />;
      })}
    </g>

    <g transform="translate(450 876)">
      <rect x="-250" y="-22" width="500" height="32" rx="16" fill="#fff" stroke="#ddd8cf" />
      <text x="0" y="-2" textAnchor="middle" fontSize="14" fontWeight="700" fill="#5a5650">{chart.type} · {chart.authority} · {chart.profile} · {chart.definition}</text>
    </g>
  </svg>;
}
