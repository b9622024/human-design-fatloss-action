"use client";

import type { HumanDesignActivation } from "@/lib/human-design/activations";
import { CHANNELS, type CenterId, type CoreHumanDesignChart } from "@/lib/human-design/topology";

export const BODYGRAPH_RENDERER_VERSION = "V13";

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
 * V13 uses a compact, fixed BodyGraph geometry closer to the traditional layout.
 * Every channel remains one straight Gate-to-Gate segment. The important change is
 * that left/right centers are pulled back toward the body and every gate port is
 * physically anchored on a center edge. Gate numbers render as small edge badges.
 */
const CENTER_SHAPES: Record<CenterId, Shape> = {
  Head: { kind: "polygon", points: [{ x: 450, y: 44 }, { x: 405, y: 122 }, { x: 495, y: 122 }] },
  Ajna: { kind: "polygon", points: [{ x: 405, y: 154 }, { x: 495, y: 154 }, { x: 450, y: 226 }] },
  Throat: { kind: "rect", x: 405, y: 258, width: 90, height: 88, rx: 6 },
  G: { kind: "polygon", points: [{ x: 450, y: 382 }, { x: 500, y: 430 }, { x: 450, y: 480 }, { x: 400, y: 430 }] },
  Ego: { kind: "polygon", points: [{ x: 528, y: 400 }, { x: 505, y: 462 }, { x: 553, y: 462 }] },
  Spleen: { kind: "polygon", points: [{ x: 235, y: 528 }, { x: 350, y: 580 }, { x: 235, y: 638 }] },
  "Solar Plexus": { kind: "polygon", points: [{ x: 665, y: 528 }, { x: 550, y: 580 }, { x: 665, y: 638 }] },
  Sacral: { kind: "rect", x: 402, y: 548, width: 96, height: 98, rx: 8 },
  Root: { kind: "rect", x: 390, y: 744, width: 120, height: 100, rx: 8 },
};

const CENTER_LABELS: Record<CenterId, Point> = {
  Head: { x: 450, y: 86 },
  Ajna: { x: 450, y: 184 },
  Throat: { x: 450, y: 302 },
  G: { x: 450, y: 430 },
  Ego: { x: 530, y: 438 },
  Spleen: { x: 277, y: 584 },
  "Solar Plexus": { x: 623, y: 584 },
  Sacral: { x: 450, y: 598 },
  Root: { x: 450, y: 797 },
};

const BODY_SYMBOL: Record<string, string> = {
  Sun: "☉", Earth: "⊕", Moon: "☽", NorthNode: "☊", SouthNode: "☋",
  Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄",
  Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

/* Exact channel origins on visible center boundaries. */
const GATE_PORTS: Record<number, Point> = {
  64: { x: 421, y: 122 }, 61: { x: 450, y: 122 }, 63: { x: 479, y: 122 },
  47: { x: 421, y: 154 }, 24: { x: 450, y: 154 }, 4: { x: 479, y: 154 },
  17: { x: 422, y: 198 }, 43: { x: 450, y: 226 }, 11: { x: 478, y: 198 },

  62: { x: 423, y: 258 }, 23: { x: 450, y: 258 }, 56: { x: 477, y: 258 },
  16: { x: 405, y: 278 }, 20: { x: 405, y: 325 },
  45: { x: 495, y: 278 }, 12: { x: 495, y: 302 }, 35: { x: 495, y: 326 },
  31: { x: 423, y: 346 }, 8: { x: 450, y: 346 }, 33: { x: 477, y: 346 },

  7: { x: 450, y: 382 }, 1: { x: 423, y: 408 }, 13: { x: 477, y: 408 },
  10: { x: 400, y: 430 }, 25: { x: 500, y: 430 },
  2: { x: 423, y: 457 }, 15: { x: 450, y: 480 }, 46: { x: 477, y: 457 },

  21: { x: 522, y: 417 }, 51: { x: 509, y: 447 }, 26: { x: 516, y: 462 }, 40: { x: 542, y: 462 },

  48: { x: 337, y: 574 }, 57: { x: 343, y: 577 }, 44: { x: 350, y: 580 },
  50: { x: 342, y: 584 }, 32: { x: 314, y: 598 }, 18: { x: 279, y: 615 }, 28: { x: 246, y: 632 },

  36: { x: 563, y: 574 }, 22: { x: 557, y: 577 }, 37: { x: 550, y: 580 },
  6: { x: 558, y: 584 }, 49: { x: 586, y: 598 }, 55: { x: 621, y: 615 }, 30: { x: 654, y: 632 },

  5: { x: 426, y: 548 }, 14: { x: 450, y: 548 }, 29: { x: 474, y: 548 },
  34: { x: 402, y: 570 }, 27: { x: 402, y: 596 }, 59: { x: 402, y: 622 },
  3: { x: 426, y: 646 }, 9: { x: 450, y: 646 }, 42: { x: 474, y: 646 },

  54: { x: 398, y: 744 }, 58: { x: 416, y: 744 }, 38: { x: 434, y: 744 },
  60: { x: 450, y: 744 }, 52: { x: 466, y: 744 }, 53: { x: 484, y: 744 }, 19: { x: 502, y: 744 },
  39: { x: 510, y: 774 }, 41: { x: 510, y: 812 },
};

const GATE_CENTER = new Map<number, CenterId>();
for (const channel of CHANNELS) {
  GATE_CENTER.set(channel.gateA, channel.centerA);
  GATE_CENTER.set(channel.gateB, channel.centerB);
}

/* Small label nudges only for the densest clusters. Ports themselves never move. */
const GATE_LABEL_OVERRIDES: Partial<Record<number, Point>> = {
  48: { x: 333, y: 564 }, 57: { x: 344, y: 578 }, 44: { x: 353, y: 590 }, 50: { x: 339, y: 600 },
  36: { x: 567, y: 564 }, 22: { x: 556, y: 578 }, 37: { x: 547, y: 590 }, 6: { x: 561, y: 600 },
  54: { x: 398, y: 756 }, 58: { x: 416, y: 756 }, 38: { x: 434, y: 756 },
  60: { x: 450, y: 756 }, 52: { x: 466, y: 756 }, 53: { x: 484, y: 756 }, 19: { x: 502, y: 756 },
  21: { x: 519, y: 410 }, 51: { x: 508, y: 443 }, 26: { x: 516, y: 472 }, 40: { x: 542, y: 472 },
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
  if (source === "personality") return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#171720" strokeWidth="7.4" strokeLinecap="butt" />;
  if (source === "design") return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#d94a40" strokeWidth="7.4" strokeLinecap="butt" />;
  const [a1, b1] = offsetSegment(a, b, -2.3);
  const [a2, b2] = offsetSegment(a, b, 2.3);
  return <g>
    <line x1={a1.x} y1={a1.y} x2={b1.x} y2={b1.y} stroke="#171720" strokeWidth="3.4" strokeLinecap="butt" />
    <line x1={a2.x} y1={a2.y} x2={b2.x} y2={b2.y} stroke="#d94a40" strokeWidth="3.4" strokeLinecap="butt" />
  </g>;
}

function renderCenter(center: CenterId, defined: boolean) {
  const shape = CENTER_SHAPES[center];
  const fill = defined ? CENTER_FILL[center] : "#ffffff";
  const common = { fill, stroke: "#171720", strokeWidth: 3.2 };
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
  const inset = 8.5;
  return { x: port.x + (dx / len) * inset, y: port.y + (dy / len) * inset };
}

function gateTextColor(source: GateSource) {
  if (source === "design") return "#d94a40";
  if (source === "personality") return "#171720";
  if (source === "both") return "#7c2630";
  return "#6b6862";
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

  return <svg viewBox="0 0 900 900" width="100%" style={{ maxWidth: width, height: "auto" }} role="img" aria-label="Human Design BodyGraph">
    <rect x="0" y="0" width="900" height="900" rx="24" fill="#fbfaf7" />
    <ActivationPanel x={34} title="Design" color="#d94a40" activations={designActivations} align="left" />
    <ActivationPanel x={866} title="Personality" color="#171720" activations={personalityActivations} align="right" />

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
        const stubA = lerp(a, b, 0.31);
        const stubB = lerp(b, a, 0.31);
        return <g key={id}>
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#d4d2cc" strokeWidth="4.2" strokeLinecap="butt" />
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
        <text x={CENTER_LABELS[center].x} y={CENTER_LABELS[center].y + 5} textAnchor="middle" fontSize="15" fontWeight="800" fill="#171720">{center === "Solar Plexus" ? "Solar" : center}</text>
      </g>)}
    </g>

    <g>
      {Object.keys(GATE_PORTS).map((gateString) => {
        const gate = Number(gateString);
        const p = gateLabelPoint(gate);
        const source = sourceForGate(gate, personalityGates, designGates);
        return <g key={`gate-${gate}`}>
          <circle cx={p.x} cy={p.y} r="8.1" fill="#fbfaf7" opacity="0.97" />
          <text x={p.x} y={p.y + 3.4} textAnchor="middle" fontSize="9.5" fontWeight="900" fill={gateTextColor(source)}>{gate}</text>
        </g>;
      })}
    </g>

    <g transform="translate(450 874)">
      <rect x="-245" y="-22" width="490" height="32" rx="16" fill="#ffffff" stroke="#ddd8cf" />
      <text x="0" y="-2" textAnchor="middle" fontSize="14" fontWeight="700" fill="#5a5650">{chart.type} · {chart.authority} · {chart.profile} · {chart.definition}</text>
    </g>
  </svg>;
}
