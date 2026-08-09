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
 * V10 architecture reset.
 * This is no longer a generic graph renderer. It is a fixed Human Design
 * BodyGraph drawing system: compact canonical center proportions, explicit
 * gate ports, and channel-specific straight/polyline rail corridors.
 */
const CENTER_SHAPES: Record<CenterId, Shape> = {
  Head: {
    kind: "polygon",
    points: [
      { x: 450, y: 48 },
      { x: 414, y: 116 },
      { x: 486, y: 116 },
    ],
  },
  Ajna: {
    kind: "polygon",
    points: [
      { x: 414, y: 146 },
      { x: 486, y: 146 },
      { x: 450, y: 214 },
    ],
  },
  Throat: { kind: "rect", x: 414, y: 240, width: 72, height: 76, rx: 5 },
  G: {
    kind: "polygon",
    points: [
      { x: 450, y: 342 },
      { x: 493, y: 383 },
      { x: 450, y: 426 },
      { x: 407, y: 383 },
    ],
  },
  Ego: {
    kind: "polygon",
    points: [
      { x: 524, y: 350 },
      { x: 503, y: 404 },
      { x: 554, y: 404 },
    ],
  },
  Spleen: {
    kind: "polygon",
    points: [
      { x: 284, y: 444 },
      { x: 382, y: 486 },
      { x: 284, y: 536 },
    ],
  },
  "Solar Plexus": {
    kind: "polygon",
    points: [
      { x: 616, y: 444 },
      { x: 518, y: 486 },
      { x: 616, y: 536 },
    ],
  },
  Sacral: { kind: "rect", x: 414, y: 462, width: 72, height: 78, rx: 6 },
  Root: { kind: "rect", x: 408, y: 584, width: 84, height: 84, rx: 6 },
};

const CENTER_LABELS: Record<CenterId, Point> = {
  Head: { x: 450, y: 83 },
  Ajna: { x: 450, y: 174 },
  Throat: { x: 450, y: 280 },
  G: { x: 450, y: 386 },
  Ego: { x: 529, y: 386 },
  Spleen: { x: 322, y: 492 },
  "Solar Plexus": { x: 578, y: 492 },
  Sacral: { x: 450, y: 505 },
  Root: { x: 450, y: 630 },
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

const GATE_PORTS: Record<number, Point> = {
  64: { x: 432, y: 116 }, 61: { x: 450, y: 116 }, 63: { x: 468, y: 116 },
  47: { x: 432, y: 146 }, 24: { x: 450, y: 146 }, 4: { x: 468, y: 146 },
  17: { x: 432, y: 180 }, 43: { x: 450, y: 214 }, 11: { x: 468, y: 180 },

  62: { x: 432, y: 240 }, 23: { x: 450, y: 240 }, 56: { x: 468, y: 240 },
  16: { x: 414, y: 258 }, 20: { x: 414, y: 283 },
  45: { x: 486, y: 255 }, 12: { x: 486, y: 278 }, 35: { x: 486, y: 301 },
  31: { x: 432, y: 316 }, 8: { x: 450, y: 316 }, 33: { x: 468, y: 316 },

  1: { x: 427, y: 364 }, 7: { x: 450, y: 342 }, 13: { x: 473, y: 364 },
  10: { x: 407, y: 383 }, 25: { x: 493, y: 383 },
  2: { x: 427, y: 406 }, 15: { x: 450, y: 426 }, 46: { x: 473, y: 406 },

  21: { x: 516, y: 371 }, 51: { x: 508, y: 391 }, 26: { x: 516, y: 404 }, 40: { x: 545, y: 404 },

  48: { x: 363, y: 478 }, 57: { x: 374, y: 483 }, 44: { x: 382, y: 486 }, 50: { x: 371, y: 498 },
  32: { x: 342, y: 507 }, 18: { x: 320, y: 518 }, 28: { x: 298, y: 529 },

  36: { x: 537, y: 478 }, 22: { x: 526, y: 483 }, 37: { x: 518, y: 486 }, 6: { x: 529, y: 498 },
  49: { x: 558, y: 507 }, 55: { x: 580, y: 518 }, 30: { x: 602, y: 529 },

  5: { x: 432, y: 462 }, 14: { x: 450, y: 462 }, 29: { x: 468, y: 462 },
  34: { x: 414, y: 480 }, 27: { x: 414, y: 501 }, 59: { x: 414, y: 522 },
  3: { x: 432, y: 540 }, 9: { x: 450, y: 540 }, 42: { x: 468, y: 540 },

  54: { x: 414, y: 584 }, 58: { x: 426, y: 584 }, 38: { x: 438, y: 584 },
  60: { x: 450, y: 584 }, 52: { x: 462, y: 584 }, 53: { x: 474, y: 584 }, 19: { x: 486, y: 584 },
  39: { x: 492, y: 611 }, 41: { x: 492, y: 643 },
};

const GATE_CENTER = new Map<number, CenterId>();
for (const channel of CHANNELS) {
  GATE_CENTER.set(channel.gateA, channel.centerA);
  GATE_CENTER.set(channel.gateB, channel.centerB);
}

/*
 * Explicit channel rails. They are intentionally piecewise-straight so the
 * visible network resembles the traditional BodyGraph rather than a generic
 * force-directed graph. Endpoints are always the actual gate ports.
 */
const CHANNEL_ROUTES: Record<string, Point[]> = {
  "47-64": [{ x: 432, y: 116 }, { x: 432, y: 146 }],
  "24-61": [{ x: 450, y: 116 }, { x: 450, y: 146 }],
  "4-63": [{ x: 468, y: 116 }, { x: 468, y: 146 }],

  "17-62": [{ x: 432, y: 180 }, { x: 430, y: 211 }, { x: 432, y: 240 }],
  "23-43": [{ x: 450, y: 214 }, { x: 450, y: 240 }],
  "11-56": [{ x: 468, y: 180 }, { x: 470, y: 211 }, { x: 468, y: 240 }],

  "16-48": [{ x: 414, y: 258 }, { x: 395, y: 340 }, { x: 380, y: 420 }, { x: 363, y: 478 }],
  "20-57": [{ x: 414, y: 283 }, { x: 401, y: 347 }, { x: 388, y: 421 }, { x: 374, y: 483 }],
  "10-20": [{ x: 414, y: 283 }, { x: 405, y: 330 }, { x: 407, y: 383 }],
  "20-34": [{ x: 414, y: 283 }, { x: 402, y: 365 }, { x: 402, y: 447 }, { x: 414, y: 480 }],

  "12-22": [{ x: 486, y: 278 }, { x: 500, y: 350 }, { x: 514, y: 425 }, { x: 526, y: 483 }],
  "35-36": [{ x: 486, y: 301 }, { x: 504, y: 360 }, { x: 522, y: 426 }, { x: 537, y: 478 }],
  "21-45": [{ x: 486, y: 255 }, { x: 502, y: 315 }, { x: 516, y: 371 }],

  "7-31": [{ x: 432, y: 316 }, { x: 440, y: 331 }, { x: 450, y: 342 }],
  "1-8": [{ x: 450, y: 316 }, { x: 442, y: 340 }, { x: 427, y: 364 }],
  "13-33": [{ x: 468, y: 316 }, { x: 470, y: 339 }, { x: 473, y: 364 }],

  "2-14": [{ x: 427, y: 406 }, { x: 438, y: 434 }, { x: 450, y: 462 }],
  "5-15": [{ x: 432, y: 462 }, { x: 440, y: 443 }, { x: 450, y: 426 }],
  "29-46": [{ x: 468, y: 462 }, { x: 472, y: 434 }, { x: 473, y: 406 }],
  "10-34": [{ x: 407, y: 383 }, { x: 403, y: 432 }, { x: 414, y: 480 }],

  "34-57": [{ x: 414, y: 480 }, { x: 395, y: 481 }, { x: 374, y: 483 }],
  "27-50": [{ x: 414, y: 501 }, { x: 392, y: 501 }, { x: 371, y: 498 }],

  "32-54": [{ x: 342, y: 507 }, { x: 366, y: 545 }, { x: 414, y: 584 }],
  "18-58": [{ x: 320, y: 518 }, { x: 361, y: 552 }, { x: 426, y: 584 }],
  "28-38": [{ x: 298, y: 529 }, { x: 355, y: 559 }, { x: 438, y: 584 }],

  "3-60": [{ x: 432, y: 540 }, { x: 440, y: 562 }, { x: 450, y: 584 }],
  "9-52": [{ x: 450, y: 540 }, { x: 456, y: 562 }, { x: 462, y: 584 }],
  "42-53": [{ x: 468, y: 540 }, { x: 471, y: 562 }, { x: 474, y: 584 }],

  "19-49": [{ x: 486, y: 584 }, { x: 520, y: 552 }, { x: 558, y: 507 }],
  "39-55": [{ x: 492, y: 611 }, { x: 535, y: 560 }, { x: 580, y: 518 }],
  "30-41": [{ x: 492, y: 643 }, { x: 550, y: 584 }, { x: 602, y: 529 }],

  "25-51": [{ x: 493, y: 383 }, { x: 500, y: 386 }, { x: 508, y: 391 }],
  "26-44": [{ x: 516, y: 404 }, { x: 465, y: 443 }, { x: 420, y: 469 }, { x: 382, y: 486 }],
  "37-40": [{ x: 545, y: 404 }, { x: 534, y: 444 }, { x: 518, y: 486 }],
  "10-57": [{ x: 407, y: 383 }, { x: 397, y: 430 }, { x: 387, y: 463 }, { x: 374, y: 483 }],
  "6-59": [{ x: 414, y: 522 }, { x: 462, y: 517 }, { x: 500, y: 507 }, { x: 529, y: 498 }],
};

function canonicalChannelId(gateA: number, gateB: number) {
  return `${Math.min(gateA, gateB)}-${Math.max(gateA, gateB)}`;
}

function routeFor(gateA: number, gateB: number): Point[] {
  const id = canonicalChannelId(gateA, gateB);
  const base = CHANNEL_ROUTES[id] ?? [GATE_PORTS[gateA], GATE_PORTS[gateB]];
  const first = base[0];
  const actualA = GATE_PORTS[gateA];
  const actualB = GATE_PORTS[gateB];
  if (!actualA || !actualB) return base;
  const dA = Math.hypot(first.x - actualA.x, first.y - actualA.y);
  const dB = Math.hypot(first.x - actualB.x, first.y - actualB.y);
  return dA <= dB ? base : [...base].reverse();
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
  if (source === "personality") return ["#191820"];
  if (source === "design") return ["#d84238"];
  if (source === "both") return ["#191820", "#d84238"];
  return [];
}

function polylineLength(points: Point[]) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  return total;
}

function pointAtDistance(points: Point[], distance: number): { point: Point; segmentIndex: number } {
  let remaining = distance;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (remaining <= len) {
      const t = len === 0 ? 0 : remaining / len;
      return { point: { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }, segmentIndex: i };
    }
    remaining -= len;
  }
  return { point: points[points.length - 1], segmentIndex: points.length - 1 };
}

function sliceRoute(points: Point[], startFraction: number, endFraction: number): Point[] {
  const total = polylineLength(points);
  const start = pointAtDistance(points, total * startFraction);
  const end = pointAtDistance(points, total * endFraction);
  const result: Point[] = [start.point];
  for (let i = start.segmentIndex; i < end.segmentIndex; i += 1) result.push(points[i]);
  result.push(end.point);
  return result;
}

function pointsString(points: Point[]) {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

function offsetPolyline(points: Point[], offset: number): Point[] {
  if (points.length < 2) return points;
  return points.map((p, i) => {
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: p.x + (-dy / len) * offset, y: p.y + (dx / len) * offset };
  });
}

function ColoredRail({ points, source }: { points: Point[]; source: GateSource }) {
  const colors = sourceColors(source);
  if (!colors.length) return null;
  if (colors.length === 1) {
    return <polyline points={pointsString(points)} fill="none" stroke={colors[0]} strokeWidth="6" strokeLinejoin="miter" strokeLinecap="butt" />;
  }
  return (
    <g>
      <polyline points={pointsString(offsetPolyline(points, -2.2))} fill="none" stroke={colors[0]} strokeWidth="3" strokeLinejoin="miter" strokeLinecap="butt" />
      <polyline points={pointsString(offsetPolyline(points, 2.2))} fill="none" stroke={colors[1]} strokeWidth="3" strokeLinejoin="miter" strokeLinecap="butt" />
    </g>
  );
}

function renderCenter(center: CenterId, defined: boolean) {
  const shape = CENTER_SHAPES[center];
  const fill = defined ? CENTER_FILL[center] : "#ffffff";
  const common = { fill, stroke: "#191820", strokeWidth: 2.3 };
  if (shape.kind === "rect") return <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={shape.rx} {...common} />;
  return <polygon points={shape.points.map((p) => `${p.x},${p.y}`).join(" ")} {...common} />;
}

function centerAnchor(center: CenterId): Point {
  return CENTER_LABELS[center];
}

function gateLabelPoint(gate: number): Point {
  const port = GATE_PORTS[gate];
  const center = GATE_CENTER.get(gate);
  if (!center) return port;
  const target = centerAnchor(center);
  const dx = target.x - port.x;
  const dy = target.y - port.y;
  const len = Math.hypot(dx, dy) || 1;
  const inset = 7;
  return { x: port.x + (dx / len) * inset, y: port.y + (dy / len) * inset };
}

function gateTextColor(source: GateSource) {
  if (source === "design") return "#d84238";
  if (source === "personality") return "#191820";
  if (source === "both") return "#6f2330";
  return "#3f3d39";
}

function ActivationPanel({ x, title, color, activations, align }: { x: number; title: string; color: string; activations: HumanDesignActivation[]; align: "left" | "right" }) {
  const rowH = 30;
  const startY = 80;
  return (
    <g>
      <text x={x} y="48" textAnchor={align === "left" ? "start" : "end"} fontSize="17" fontWeight="800" fill={color}>{title}</text>
      {activations.map((a, i) => {
        const y = startY + i * rowH;
        return (
          <g key={`${title}-${a.body}`}>
            <text x={x} y={y} textAnchor={align === "left" ? "start" : "end"} fontSize="18" fontWeight="700" fill={color}>{BODY_SYMBOL[a.body] ?? "•"}</text>
            <text x={x + (align === "left" ? 25 : -25)} y={y} textAnchor={align === "left" ? "start" : "end"} fontSize="14" fontWeight="700" fill="#252433">{a.gate}.{a.line}</text>
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
    <svg viewBox="0 0 900 720" width="100%" style={{ maxWidth: width, height: "auto" }} role="img" aria-label="Human Design BodyGraph">
      <rect x="0" y="0" width="900" height="720" rx="24" fill="#fbfaf7" />
      <ActivationPanel x={34} title="Design" color="#d84238" activations={designActivations} align="left" />
      <ActivationPanel x={866} title="Personality" color="#191820" activations={personalityActivations} align="right" />

      {/* Traditional-style channel rails: dark outer rail + white inner corridor. */}
      <g>
        {CHANNELS.map((channel) => {
          const route = routeFor(channel.gateA, channel.gateB);
          const id = canonicalChannelId(channel.gateA, channel.gateB);
          const complete = activeChannels.has(id);
          const sourceA = sourceForGate(channel.gateA, personalityGates, designGates);
          const sourceB = sourceForGate(channel.gateB, personalityGates, designGates);
          const firstHalf = sliceRoute(route, 0, 0.5);
          const secondHalf = sliceRoute(route, 0.5, 1);
          const hangingA = sliceRoute(route, 0, 0.42);
          const hangingB = sliceRoute(route, 0.58, 1);

          return (
            <g key={id}>
              <polyline points={pointsString(route)} fill="none" stroke="#8f8b84" strokeWidth="10" strokeLinejoin="miter" strokeLinecap="butt" opacity="0.78" />
              <polyline points={pointsString(route)} fill="none" stroke="#ffffff" strokeWidth="6.2" strokeLinejoin="miter" strokeLinecap="butt" />
              {complete ? (
                <>
                  {sourceA !== "inactive" && <ColoredRail points={firstHalf} source={sourceA} />}
                  {sourceB !== "inactive" && <ColoredRail points={secondHalf} source={sourceB} />}
                </>
              ) : (
                <>
                  {sourceA !== "inactive" && <ColoredRail points={hangingA} source={sourceA} />}
                  {sourceB !== "inactive" && <ColoredRail points={hangingB} source={sourceB} />}
                </>
              )}
            </g>
          );
        })}
      </g>

      <g>
        {(Object.keys(CENTER_SHAPES) as CenterId[]).map((center) => (
          <g key={center}>
            {renderCenter(center, defined.has(center))}
            <text x={CENTER_LABELS[center].x} y={CENTER_LABELS[center].y + 4} textAnchor="middle" fontSize="13" fontWeight="800" fill="#191820">
              {center === "Solar Plexus" ? "Solar" : center}
            </text>
          </g>
        ))}
      </g>

      {/* Gate numbers are inset just inside their own center border, matching the chart instead of floating in space. */}
      <g>
        {Object.keys(GATE_PORTS).map((gateString) => {
          const gate = Number(gateString);
          const p = gateLabelPoint(gate);
          const source = sourceForGate(gate, personalityGates, designGates);
          return (
            <text key={`gate-${gate}`} x={p.x} y={p.y + 3} textAnchor="middle" fontSize="8.8" fontWeight="900" fill={gateTextColor(source)} paintOrder="stroke" stroke="#fbfaf7" strokeWidth="2.4" strokeLinejoin="round">
              {gate}
            </text>
          );
        })}
      </g>

      <g transform="translate(450 696)">
        <rect x="-235" y="-23" width="470" height="32" rx="16" fill="#ffffff" stroke="#ddd8cf" />
        <text x="0" y="-2" textAnchor="middle" fontSize="13" fontWeight="700" fill="#5a5650">
          {chart.type} · {chart.authority} · {chart.profile} · {chart.definition}
        </text>
      </g>
    </svg>
  );
}
