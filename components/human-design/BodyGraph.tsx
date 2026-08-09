"use client";

import type { HumanDesignActivation } from "@/lib/human-design/activations";
import { CHANNELS, type CenterId, type CoreHumanDesignChart } from "@/lib/human-design/topology";

export const BODYGRAPH_RENDERER_VERSION = "REFERENCE-GEOMETRY-1.6";

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

const CENTER_SHAPES: Record<CenterId, Shape> = {
  Head: { kind: "polygon", points: [{ x: 450, y: 44 }, { x: 405, y: 122 }, { x: 495, y: 122 }] },
  Ajna: { kind: "polygon", points: [{ x: 405, y: 154 }, { x: 495, y: 154 }, { x: 450, y: 226 }] },
  Throat: { kind: "rect", x: 405, y: 258, width: 90, height: 88, rx: 5 },
  G: { kind: "polygon", points: [{ x: 450, y: 382 }, { x: 500, y: 430 }, { x: 450, y: 480 }, { x: 400, y: 430 }] },
  Ego: { kind: "polygon", points: [{ x: 536, y: 406 }, { x: 510, y: 468 }, { x: 562, y: 468 }] },
  Spleen: { kind: "polygon", points: [{ x: 194, y: 548 }, { x: 350, y: 608 }, { x: 194, y: 676 }] },
  "Solar Plexus": { kind: "polygon", points: [{ x: 706, y: 548 }, { x: 550, y: 608 }, { x: 706, y: 676 }] },
  Sacral: { kind: "rect", x: 402, y: 572, width: 96, height: 102, rx: 8 },
  Root: { kind: "rect", x: 370, y: 760, width: 160, height: 104, rx: 8 },
};

const CENTER_LABELS: Record<CenterId, Point> = {
  Head: { x: 450, y: 86 }, Ajna: { x: 450, y: 184 }, Throat: { x: 450, y: 302 },
  G: { x: 450, y: 430 }, Ego: { x: 536, y: 444 }, Spleen: { x: 247, y: 612 },
  "Solar Plexus": { x: 653, y: 612 }, Sacral: { x: 450, y: 625 }, Root: { x: 450, y: 818 },
};

const BODY_SYMBOL: Record<string, string> = {
  Sun: "☉", Earth: "⊕", Moon: "☽", NorthNode: "☊", SouthNode: "☋",
  Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄",
  Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

/*
 * Gate slots follow the relative placement in the supplied MAIA reference:
 * G = 1 / 7 13 / 10 25 / 15 46 / 2
 * Spleen upper edge = 48 57 44 50 (outside -> apex)
 * Solar upper edge = 6 37 22 36 (apex -> outside)
 * Sacral = 5 14 29 / 34 27 | 59 / 42 3 9
 * Root = 53 60 52 / 54 38 58 | 19 39 41
 */
const GATE_PORTS: Record<number, Point> = {
  64: { x: 421, y: 122 }, 61: { x: 450, y: 122 }, 63: { x: 479, y: 122 },
  47: { x: 421, y: 154 }, 24: { x: 450, y: 154 }, 4: { x: 479, y: 154 },
  17: { x: 420, y: 202 }, 43: { x: 450, y: 226 }, 11: { x: 480, y: 202 },

  62: { x: 423, y: 258 }, 23: { x: 450, y: 258 }, 56: { x: 477, y: 258 },
  16: { x: 405, y: 278 }, 20: { x: 405, y: 325 },
  45: { x: 495, y: 278 }, 12: { x: 495, y: 302 }, 35: { x: 495, y: 326 },
  31: { x: 423, y: 346 }, 8: { x: 450, y: 346 }, 33: { x: 477, y: 346 },

  1: { x: 450, y: 382 },
  7: { x: 425, y: 406 }, 13: { x: 475, y: 406 },
  10: { x: 400, y: 430 }, 25: { x: 500, y: 430 },
  15: { x: 425, y: 456 }, 46: { x: 475, y: 456 },
  2: { x: 450, y: 480 },

  21: { x: 527, y: 427 }, 51: { x: 514, y: 449 }, 26: { x: 520, y: 468 }, 40: { x: 552, y: 468 },

  48: { x: 288, y: 584 },
  57: { x: 307, y: 591 },
  44: { x: 326, y: 599 },
  50: { x: 350, y: 608 },
  32: { x: 295, y: 632 },
  18: { x: 253, y: 650 },
  28: { x: 210, y: 669 },

  6: { x: 550, y: 608 },
  37: { x: 575, y: 598 },
  22: { x: 605, y: 587 },
  36: { x: 644, y: 572 },
  49: { x: 605, y: 632 },
  55: { x: 647, y: 650 },
  30: { x: 690, y: 669 },

  5: { x: 426, y: 572 }, 14: { x: 450, y: 572 }, 29: { x: 474, y: 572 },
  34: { x: 402, y: 596 }, 27: { x: 402, y: 626 },
  59: { x: 498, y: 626 },
  42: { x: 426, y: 674 }, 3: { x: 450, y: 674 }, 9: { x: 474, y: 674 },

  53: { x: 426, y: 760 }, 60: { x: 450, y: 760 }, 52: { x: 474, y: 760 },
  54: { x: 370, y: 782 }, 38: { x: 370, y: 812 }, 58: { x: 370, y: 842 },
  19: { x: 530, y: 782 }, 39: { x: 530, y: 812 }, 41: { x: 530, y: 842 },
};

const GATE_CENTER = new Map<number, CenterId>();
for (const channel of CHANNELS) {
  GATE_CENTER.set(channel.gateA, channel.centerA);
  GATE_CENTER.set(channel.gateB, channel.centerB);
}

const GATE_LABEL_OVERRIDES: Partial<Record<number, Point>> = {
  48: { x: 282, y: 581 }, 57: { x: 302, y: 588 }, 44: { x: 321, y: 596 }, 50: { x: 342, y: 611 },
  32: { x: 289, y: 635 }, 18: { x: 248, y: 653 }, 28: { x: 207, y: 671 },
  6: { x: 558, y: 611 }, 37: { x: 580, y: 596 }, 22: { x: 610, y: 584 }, 36: { x: 650, y: 569 },
  49: { x: 611, y: 635 }, 55: { x: 652, y: 653 }, 30: { x: 693, y: 671 },
  34: { x: 414, y: 596 }, 27: { x: 414, y: 626 }, 59: { x: 486, y: 626 },
  42: { x: 426, y: 663 }, 3: { x: 450, y: 663 }, 9: { x: 474, y: 663 },
  53: { x: 426, y: 773 }, 60: { x: 450, y: 773 }, 52: { x: 474, y: 773 },
  54: { x: 382, y: 782 }, 38: { x: 382, y: 812 }, 58: { x: 382, y: 842 },
  19: { x: 518, y: 782 }, 39: { x: 518, y: 812 }, 41: { x: 518, y: 842 },
  21: { x: 525, y: 418 }, 51: { x: 511, y: 445 }, 26: { x: 520, y: 478 }, 40: { x: 552, y: 478 },
};

function canonicalChannelId(a: number, b: number) {
  return `${Math.min(a, b)}-${Math.max(a, b)}`;
}

/*
 * Shared integration-circuit rails and right-side lanes.  These are straight
 * segments with common junctions, matching the reference's branch topology
 * instead of six unrelated diagonals.
 */
const ROUTES: Record<string, Point[]> = {
  "10-20": [GATE_PORTS[10], { x: 390, y: 430 }, { x: 390, y: 350 }, GATE_PORTS[20]],
  "20-34": [GATE_PORTS[20], { x: 390, y: 350 }, { x: 390, y: 535 }, GATE_PORTS[34]],
  "10-34": [GATE_PORTS[10], { x: 390, y: 430 }, { x: 390, y: 535 }, GATE_PORTS[34]],
  "20-57": [GATE_PORTS[20], { x: 390, y: 350 }, { x: 390, y: 510 }, { x: 350, y: 575 }, GATE_PORTS[57]],
  "34-57": [GATE_PORTS[34], { x: 390, y: 535 }, { x: 350, y: 575 }, GATE_PORTS[57]],
  "10-57": [GATE_PORTS[10], { x: 390, y: 430 }, { x: 390, y: 510 }, { x: 350, y: 575 }, GATE_PORTS[57]],

  "12-22": [GATE_PORTS[12], { x: 512, y: 335 }, { x: 540, y: 430 }, { x: 575, y: 535 }, GATE_PORTS[22]],
  "35-36": [GATE_PORTS[35], { x: 530, y: 350 }, { x: 575, y: 435 }, { x: 625, y: 525 }, GATE_PORTS[36]],
  "37-40": [GATE_PORTS[40], { x: 565, y: 485 }, { x: 585, y: 550 }, GATE_PORTS[37]],
};

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
  if (source === "personality") return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#171720" strokeWidth="7.2" strokeLinecap="butt" />;
  if (source === "design") return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#d94a40" strokeWidth="7.2" strokeLinecap="butt" />;
  const [a1, b1] = offsetSegment(a, b, -2.25);
  const [a2, b2] = offsetSegment(a, b, 2.25);
  return <g>
    <line x1={a1.x} y1={a1.y} x2={b1.x} y2={b1.y} stroke="#171720" strokeWidth="3.3" strokeLinecap="butt" />
    <line x1={a2.x} y1={a2.y} x2={b2.x} y2={b2.y} stroke="#d94a40" strokeWidth="3.3" strokeLinecap="butt" />
  </g>;
}

function sourceColor(source: GateSource) {
  if (source === "design") return "#d94a40";
  if (source === "personality") return "#171720";
  if (source === "both") return "#7c2630";
  return "#68645e";
}

function routeFor(gateA: number, gateB: number): Point[] | null {
  const id = canonicalChannelId(gateA, gateB);
  const route = ROUTES[id];
  if (!route) return null;
  const min = Math.min(gateA, gateB);
  return gateA === min ? route : [...route].reverse();
}

function pointsAttr(points: Point[]) {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

function RoutedActivation({ points, sourceA, sourceB, complete }: { points: Point[]; sourceA: GateSource; sourceB: GateSource; complete: boolean }) {
  const split = Math.max(1, Math.floor(points.length / 2));
  const first = points.slice(0, split + 1);
  const second = points.slice(split);
  if (complete) {
    return <g>
      {sourceA !== "inactive" && <polyline points={pointsAttr(first)} fill="none" stroke={sourceColor(sourceA)} strokeWidth="7.2" strokeLinejoin="miter" strokeLinecap="butt" />}
      {sourceB !== "inactive" && <polyline points={pointsAttr(second)} fill="none" stroke={sourceColor(sourceB)} strokeWidth="7.2" strokeLinejoin="miter" strokeLinecap="butt" />}
    </g>;
  }
  const stubA = first.slice(0, Math.min(2, first.length));
  const stubB = second.slice(Math.max(0, second.length - 2));
  return <g>
    {sourceA !== "inactive" && <polyline points={pointsAttr(stubA)} fill="none" stroke={sourceColor(sourceA)} strokeWidth="7.2" strokeLinecap="butt" />}
    {sourceB !== "inactive" && <polyline points={pointsAttr(stubB)} fill="none" stroke={sourceColor(sourceB)} strokeWidth="7.2" strokeLinecap="butt" />}
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
  const inset = 8;
  return { x: port.x + (dx / len) * inset, y: port.y + (dy / len) * inset };
}

function gateTextColor(source: GateSource) {
  if (source === "design") return "#d94a40";
  if (source === "personality") return "#171720";
  if (source === "both") return "#7c2630";
  return "#68645e";
}

function GateBadge({ gate, source }: { gate: number; source: GateSource }) {
  const p = gateLabelPoint(gate);
  const active = source !== "inactive";
  return <g>
    <circle cx={p.x} cy={p.y} r={active ? 7.2 : 6.2} fill="#fbfaf7" opacity="0.98" />
    <text x={p.x} y={p.y + 3.2} textAnchor="middle" fontSize="9.2" fontWeight="900" fill={gateTextColor(source)}>{gate}</text>
  </g>;
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

  return <svg viewBox="0 0 900 920" width="100%" style={{ maxWidth: width, height: "auto" }} role="img" aria-label="Human Design BodyGraph">
    <rect x="0" y="0" width="900" height="920" rx="24" fill="#fbfaf7" />
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
        const route = routeFor(channel.gateA, channel.gateB);

        if (route) {
          return <g key={id}>
            <polyline points={pointsAttr(route)} fill="none" stroke="#b6b1aa" strokeWidth="3.2" strokeLinejoin="miter" strokeLinecap="butt" opacity="0.9" />
            <RoutedActivation points={route} sourceA={sourceA} sourceB={sourceB} complete={complete} />
          </g>;
        }

        const mid = midpoint(a, b);
        const stubA = lerp(a, b, 0.34);
        const stubB = lerp(b, a, 0.34);
        return <g key={id}>
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#b6b1aa" strokeWidth="3.2" strokeLinecap="butt" opacity="0.9" />
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
        const source = sourceForGate(gate, personalityGates, designGates);
        return <GateBadge key={`gate-${gate}`} gate={gate} source={source} />;
      })}
    </g>

    <g transform="translate(450 894)">
      <rect x="-245" y="-22" width="490" height="32" rx="16" fill="#ffffff" stroke="#ddd8cf" />
      <text x="0" y="-2" textAnchor="middle" fontSize="14" fontWeight="700" fill="#5a5650">{chart.type} · {chart.authority} · {chart.profile} · {chart.definition}</text>
    </g>
  </svg>;
}
