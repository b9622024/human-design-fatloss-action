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

function centerShape(center: CenterId, defined: boolean) {
  const p = CENTER_POINTS[center];
  const fill = defined ? CENTER_FILL[center] : "#ffffff";
  const stroke = "#252433";
  const common = { fill, stroke, strokeWidth: 2.8 };

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
  return ["#dedbd5"];
}

function shiftedLine(p1: Point, p2: Point, offset: number) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
  const ox = (-dy / len) * offset;
  const oy = (dx / len) * offset;
  return {
    a: { x: p1.x + ox, y: p1.y + oy },
    b: { x: p2.x + ox, y: p2.y + oy },
  };
}

function interp(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function GateSegment({ a, b, source, active }: { a: Point; b: Point; source: GateSource; active: boolean }) {
  const colors = sourceColors(source);
  if (!active) {
    return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#dedbd5" strokeWidth="5" strokeLinecap="round" />;
  }
  if (colors.length === 1) {
    return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={colors[0]} strokeWidth="8" strokeLinecap="round" />;
  }
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
  const ox = (-dy / len) * 2.2;
  const oy = (dx / len) * 2.2;
  return (
    <g>
      <line x1={a.x + ox} y1={a.y + oy} x2={b.x + ox} y2={b.y + oy} stroke={colors[0]} strokeWidth="4" strokeLinecap="round" />
      <line x1={a.x - ox} y1={a.y - oy} x2={b.x - ox} y2={b.y - oy} stroke={colors[1]} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
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

  const pairGroups = new Map<string, number[]>();
  CHANNELS.forEach((channel, index) => {
    const pair = [channel.centerA, channel.centerB].sort().join("|");
    const list = pairGroups.get(pair) ?? [];
    list.push(index);
    pairGroups.set(pair, list);
  });

  return (
    <svg viewBox="0 0 900 850" width={width} role="img" aria-label="Human Design BodyGraph">
      <rect x="0" y="0" width="900" height="850" rx="28" fill="#fbfaf7" />

      <ActivationPanel x={38} title="Design" color="#d94a43" activations={designActivations} align="left" />
      <ActivationPanel x={862} title="Personality" color="#24212d" activations={personalityActivations} align="right" />

      {CHANNELS.map((channel, index) => {
        const id = canonicalChannelId(channel.gateA, channel.gateB);
        const active = activeChannels.has(id);
        const pair = [channel.centerA, channel.centerB].sort().join("|");
        const siblings = pairGroups.get(pair) ?? [index];
        const siblingIndex = siblings.indexOf(index);
        const offset = (siblingIndex - (siblings.length - 1) / 2) * 12;
        const line = shiftedLine(CENTER_POINTS[channel.centerA], CENTER_POINTS[channel.centerB], offset);
        const mid = interp(line.a, line.b, 0.5);
        const gateAPos = interp(line.a, mid, 0.72);
        const gateBPos = interp(line.b, mid, 0.72);
        const sourceA = sourceForGate(channel.gateA, personalityGates, designGates);
        const sourceB = sourceForGate(channel.gateB, personalityGates, designGates);
        return (
          <g key={`${id}-${index}`}>
            <GateSegment a={line.a} b={mid} source={sourceA} active={active} />
            <GateSegment a={mid} b={line.b} source={sourceB} active={active} />
            <text x={gateAPos.x} y={gateAPos.y - 4} textAnchor="middle" fontSize="12" fontWeight="800" fill={active ? "#252433" : "#77736d"} paintOrder="stroke" stroke="#fbfaf7" strokeWidth="4">{channel.gateA}</text>
            <text x={gateBPos.x} y={gateBPos.y - 4} textAnchor="middle" fontSize="12" fontWeight="800" fill={active ? "#252433" : "#77736d"} paintOrder="stroke" stroke="#fbfaf7" strokeWidth="4">{channel.gateB}</text>
          </g>
        );
      })}

      {(Object.keys(CENTER_POINTS) as CenterId[]).map((center) => (
        <g key={center}>
          {centerShape(center, defined.has(center))}
          <text x={CENTER_POINTS[center].x} y={CENTER_POINTS[center].y + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill="#252433">
            {center === "Solar Plexus" ? "Solar" : center}
          </text>
        </g>
      ))}

      <g transform="translate(450 822)">
        <rect x="-245" y="-24" width="490" height="34" rx="17" fill="#ffffff" stroke="#e3dfd7" />
        <text x="0" y="-2" textAnchor="middle" fontSize="14" fontWeight="700" fill="#5f5a54">
          {chart.type} · {chart.authority} · {chart.profile} · {chart.definition}
        </text>
      </g>
    </svg>
  );
}
