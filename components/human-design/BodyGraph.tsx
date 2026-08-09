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

const CENTER_POINTS: Record<CenterId, Point> = {
  Head: { x: 450, y: 86 },
  Ajna: { x: 450, y: 190 },
  Throat: { x: 450, y: 310 },
  G: { x: 450, y: 445 },
  Ego: { x: 575, y: 455 },
  Spleen: { x: 305, y: 565 },
  "Solar Plexus": { x: 600, y: 575 },
  Sacral: { x: 450, y: 625 },
  Root: { x: 450, y: 760 },
};

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

const BODY_SYMBOL: Record<string, string> = {
  Sun: "☉", Earth: "⊕", Moon: "☽", NorthNode: "☊", SouthNode: "☋",
  Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄",
  Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

const GATE_PORTS: Record<number, Point> = {
  64: { x: 420, y: 119 }, 61: { x: 450, y: 122 }, 63: { x: 480, y: 119 },
  47: { x: 420, y: 156 }, 24: { x: 450, y: 154 }, 4: { x: 480, y: 156 },
  17: { x: 420, y: 224 }, 43: { x: 450, y: 228 }, 11: { x: 480, y: 224 },
  62: { x: 420, y: 271 }, 23: { x: 450, y: 271 }, 56: { x: 480, y: 271 },
  16: { x: 400, y: 292 }, 20: { x: 400, y: 320 },
  31: { x: 425, y: 349 }, 8: { x: 450, y: 349 }, 33: { x: 475, y: 349 },
  45: { x: 500, y: 292 }, 12: { x: 500, y: 315 }, 35: { x: 500, y: 338 },
  1: { x: 430, y: 398 }, 7: { x: 450, y: 393 }, 13: { x: 470, y: 398 },
  10: { x: 402, y: 445 }, 25: { x: 500, y: 438 },
  2: { x: 430, y: 492 }, 15: { x: 450, y: 497 }, 46: { x: 470, y: 492 },
  21: { x: 557, y: 424 }, 51: { x: 538, y: 456 }, 26: { x: 556, y: 483 }, 40: { x: 608, y: 477 },
  48: { x: 348, y: 530 }, 57: { x: 350, y: 550 }, 44: { x: 350, y: 570 }, 50: { x: 348, y: 590 },
  32: { x: 314, y: 613 }, 18: { x: 294, y: 606 }, 28: { x: 276, y: 596 },
  36: { x: 557, y: 536 }, 22: { x: 552, y: 555 }, 37: { x: 550, y: 576 }, 6: { x: 552, y: 598 },
  49: { x: 592, y: 620 }, 55: { x: 612, y: 612 }, 30: { x: 630, y: 600 },
  34: { x: 400, y: 596 }, 27: { x: 402, y: 615 }, 59: { x: 402, y: 635 },
  5: { x: 425, y: 586 }, 14: { x: 450, y: 586 }, 29: { x: 475, y: 586 },
  3: { x: 425, y: 664 }, 9: { x: 450, y: 664 }, 42: { x: 475, y: 664 },
  54: { x: 392, y: 725 }, 58: { x: 410, y: 721 }, 38: { x: 428, y: 721 },
  60: { x: 444, y: 721 }, 52: { x: 460, y: 721 }, 53: { x: 476, y: 721 },
  19: { x: 492, y: 725 }, 39: { x: 508, y: 730 }, 41: { x: 520, y: 740 },
};

function centerShape(center: CenterId, defined: boolean) {
  const p = CENTER_POINTS[center];
  const fill = defined ? CENTER_FILL[center] : "#ffffff";
  const common = { fill, stroke: "#252433", strokeWidth: 2.8 };
  if (center === "Head") return <polygon points={`${p.x},${p.y - 43} ${p.x - 55},${p.y + 36} ${p.x + 55},${p.y + 36}`} {...common} />;
  if (center === "Ajna") return <polygon points={`${p.x - 55},${p.y - 36} ${p.x + 55},${p.y - 36} ${p.x},${p.y + 44}`} {...common} />;
  if (center === "G") return <polygon points={`${p.x},${p.y - 52} ${p.x + 52},${p.y} ${p.x},${p.y + 52} ${p.x - 52},${p.y}`} {...common} />;
  if (center === "Ego") return <polygon points={`${p.x - 40},${p.y + 30} ${p.x + 40},${p.y + 30} ${p.x},${p.y - 35}`} {...common} />;
  if (center === "Spleen") return <polygon points={`${p.x - 50},${p.y - 50} ${p.x + 50},${p.y} ${p.x - 50},${p.y + 50}`} {...common} />;
  if (center === "Solar Plexus") return <polygon points={`${p.x + 50},${p.y - 50} ${p.x - 50},${p.y} ${p.x + 50},${p.y + 50}`} {...common} />;
  return <rect x={p.x - 50} y={p.y - 39} width={100} height={78} rx={center === "Throat" ? 5 : 9} {...common} />;
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

function StraightSegment({ a, b, source, width = 7 }: { a: Point; b: Point; source: GateSource; width?: number }) {
  const colors = sourceColors(source);
  if (!colors.length) return null;
  if (colors.length === 1) {
    return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={colors[0]} strokeWidth={width} strokeLinecap="butt" />;
  }
  const [a1, b1] = offsetSegment(a, b, -2.1);
  const [a2, b2] = offsetSegment(a, b, 2.1);
  return (
    <g>
      <line x1={a1.x} y1={a1.y} x2={b1.x} y2={b1.y} stroke={colors[0]} strokeWidth={Math.max(3.2, width / 2)} strokeLinecap="butt" />
      <line x1={a2.x} y1={a2.y} x2={b2.x} y2={b2.y} stroke={colors[1]} strokeWidth={Math.max(3.2, width / 2)} strokeLinecap="butt" />
    </g>
  );
}

function gateTextColor(source: GateSource) {
  if (source === "design") return "#d94a43";
  if (source === "personality") return "#24212d";
  if (source === "both") return "#7f2d37";
  return "#817d77";
}

function ActivationPanel({ x, title, color, activations, align }: { x: number; title: string; color: string; activations: HumanDesignActivation[]; align: "left" | "right" }) {
  const rowH = 32;
  const startY = 95;
  return (
    <g>
      <text x={x} y="55" textAnchor={align === "left" ? "start" : "end"} fontSize="18" fontWeight="800" fill={color}>{title}</text>
      {activations.map((a, i) => {
        const y = startY + i * rowH;
        return (
          <g key={`${title}-${a.body}`}>
            <text x={x} y={y} textAnchor={align === "left" ? "start" : "end"} fontSize="20" fontWeight="700" fill={color}>{BODY_SYMBOL[a.body] ?? "•"}</text>
            <text x={x + (align === "left" ? 28 : -28)} y={y} textAnchor={align === "left" ? "start" : "end"} fontSize="15" fontWeight="700" fill="#252433">{a.gate}.{a.line}</text>
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
  const gateSources = new Map<number, GateSource>();
  Object.keys(GATE_PORTS).forEach((g) => gateSources.set(Number(g), sourceForGate(Number(g), personalityGates, designGates)));

  return (
    <svg viewBox="0 0 900 850" width={width} role="img" aria-label="Human Design BodyGraph">
      <rect x="0" y="0" width="900" height="850" rx="28" fill="#fbfaf7" />
      <ActivationPanel x={38} title="Design" color="#d94a43" activations={designActivations} align="left" />
      <ActivationPanel x={862} title="Personality" color="#24212d" activations={personalityActivations} align="right" />

      <g>
        {CHANNELS.map((channel) => {
          const id = canonicalChannelId(channel.gateA, channel.gateB);
          const a = GATE_PORTS[channel.gateA] ?? CENTER_POINTS[channel.centerA];
          const b = GATE_PORTS[channel.gateB] ?? CENTER_POINTS[channel.centerB];
          const mid = lerp(a, b, 0.5);
          const complete = activeChannels.has(id);
          const sourceA = sourceForGate(channel.gateA, personalityGates, designGates);
          const sourceB = sourceForGate(channel.gateB, personalityGates, designGates);
          const stubA = lerp(a, b, 0.38);
          const stubB = lerp(b, a, 0.38);

          return (
            <g key={id}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#c9c5bd"
                strokeWidth="3.1"
                strokeOpacity="0.72"
                strokeLinecap="butt"
              />
              {complete ? (
                <>
                  {sourceA !== "inactive" && <StraightSegment a={a} b={mid} source={sourceA} width={7.4} />}
                  {sourceB !== "inactive" && <StraightSegment a={b} b={mid} source={sourceB} width={7.4} />}
                </>
              ) : (
                <>
                  {sourceA !== "inactive" && <StraightSegment a={a} b={stubA} source={sourceA} width={6.8} />}
                  {sourceB !== "inactive" && <StraightSegment a={b} b={stubB} source={sourceB} width={6.8} />}
                </>
              )}
            </g>
          );
        })}
      </g>

      {(Object.keys(CENTER_POINTS) as CenterId[]).map((center) => (
        <g key={center}>
          {centerShape(center, defined.has(center))}
          <text x={CENTER_POINTS[center].x} y={CENTER_POINTS[center].y + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill="#252433">
            {center === "Solar Plexus" ? "Solar" : center}
          </text>
        </g>
      ))}

      <g>
        {Object.entries(GATE_PORTS).map(([gateString, port]) => {
          const gate = Number(gateString);
          const source = gateSources.get(gate) ?? "inactive";
          return (
            <g key={`gate-${gate}`}>
              <circle cx={port.x} cy={port.y} r="8.2" fill="#fbfaf7" opacity="0.98" />
              <text x={port.x} y={port.y + 3.2} textAnchor="middle" fontSize="9.2" fontWeight="900" fill={gateTextColor(source)}>{gate}</text>
            </g>
          );
        })}
      </g>

      <g transform="translate(450 822)">
        <rect x="-245" y="-24" width="490" height="34" rx="17" fill="#ffffff" stroke="#e3dfd7" />
        <text x="0" y="-2" textAnchor="middle" fontSize="14" fontWeight="700" fill="#5f5a54">
          {chart.type} · {chart.authority} · {chart.profile} · {chart.definition}
        </text>
      </g>
    </svg>
  );
}
