import type { HumanDesignActivation } from "@/lib/human-design/activations";

export type CenterId =
  | "Head"
  | "Ajna"
  | "Throat"
  | "G"
  | "Ego"
  | "Spleen"
  | "Solar Plexus"
  | "Sacral"
  | "Root";

export type ChannelDefinition = {
  id: string;
  gateA: number;
  gateB: number;
  centerA: CenterId;
  centerB: CenterId;
};

export const CHANNELS: ChannelDefinition[] = [
  { id: "64-47", gateA: 64, gateB: 47, centerA: "Head", centerB: "Ajna" },
  { id: "61-24", gateA: 61, gateB: 24, centerA: "Head", centerB: "Ajna" },
  { id: "63-4", gateA: 63, gateB: 4, centerA: "Head", centerB: "Ajna" },
  { id: "17-62", gateA: 17, gateB: 62, centerA: "Ajna", centerB: "Throat" },
  { id: "43-23", gateA: 43, gateB: 23, centerA: "Ajna", centerB: "Throat" },
  { id: "11-56", gateA: 11, gateB: 56, centerA: "Ajna", centerB: "Throat" },
  { id: "16-48", gateA: 16, gateB: 48, centerA: "Throat", centerB: "Spleen" },
  { id: "20-57", gateA: 20, gateB: 57, centerA: "Throat", centerB: "Spleen" },
  { id: "20-10", gateA: 20, gateB: 10, centerA: "Throat", centerB: "G" },
  { id: "20-34", gateA: 20, gateB: 34, centerA: "Throat", centerB: "Sacral" },
  { id: "12-22", gateA: 12, gateB: 22, centerA: "Throat", centerB: "Solar Plexus" },
  { id: "35-36", gateA: 35, gateB: 36, centerA: "Throat", centerB: "Solar Plexus" },
  { id: "45-21", gateA: 45, gateB: 21, centerA: "Throat", centerB: "Ego" },
  { id: "31-7", gateA: 31, gateB: 7, centerA: "Throat", centerB: "G" },
  { id: "33-13", gateA: 33, gateB: 13, centerA: "Throat", centerB: "G" },
  { id: "8-1", gateA: 8, gateB: 1, centerA: "Throat", centerB: "G" },
  { id: "2-14", gateA: 2, gateB: 14, centerA: "G", centerB: "Sacral" },
  { id: "5-15", gateA: 5, gateB: 15, centerA: "Sacral", centerB: "G" },
  { id: "29-46", gateA: 29, gateB: 46, centerA: "Sacral", centerB: "G" },
  { id: "34-10", gateA: 34, gateB: 10, centerA: "Sacral", centerB: "G" },
  { id: "34-57", gateA: 34, gateB: 57, centerA: "Sacral", centerB: "Spleen" },
  { id: "27-50", gateA: 27, gateB: 50, centerA: "Sacral", centerB: "Spleen" },
  { id: "32-54", gateA: 32, gateB: 54, centerA: "Spleen", centerB: "Root" },
  { id: "18-58", gateA: 18, gateB: 58, centerA: "Spleen", centerB: "Root" },
  { id: "28-38", gateA: 28, gateB: 38, centerA: "Spleen", centerB: "Root" },
  { id: "3-60", gateA: 3, gateB: 60, centerA: "Sacral", centerB: "Root" },
  { id: "9-52", gateA: 9, gateB: 52, centerA: "Sacral", centerB: "Root" },
  { id: "42-53", gateA: 42, gateB: 53, centerA: "Sacral", centerB: "Root" },
  { id: "19-49", gateA: 19, gateB: 49, centerA: "Root", centerB: "Solar Plexus" },
  { id: "39-55", gateA: 39, gateB: 55, centerA: "Root", centerB: "Solar Plexus" },
  { id: "41-30", gateA: 41, gateB: 30, centerA: "Root", centerB: "Solar Plexus" },
  { id: "25-51", gateA: 25, gateB: 51, centerA: "G", centerB: "Ego" },
  { id: "26-44", gateA: 26, gateB: 44, centerA: "Ego", centerB: "Spleen" },
  { id: "40-37", gateA: 40, gateB: 37, centerA: "Ego", centerB: "Solar Plexus" },
  { id: "10-57", gateA: 10, gateB: 57, centerA: "G", centerB: "Spleen" },
  { id: "59-6", gateA: 59, gateB: 6, centerA: "Sacral", centerB: "Solar Plexus" },
];

export type CoreHumanDesignChart = {
  activeGates: number[];
  channels: string[];
  centers: CenterId[];
  definition: "No Definition" | "Single Definition" | "Split Definition" | "Triple Split Definition" | "Quadruple Split Definition";
  type: "Reflector" | "Generator" | "Manifesting Generator" | "Manifestor" | "Projector";
  strategy: "Wait a Lunar Cycle" | "Wait to Respond" | "Inform" | "Wait for the Invitation";
  authority: "Lunar" | "Solar Plexus" | "Sacral" | "Splenic" | "Ego Manifested" | "Ego Projected" | "Self-Projected" | "Mental / Environmental";
  profile: string;
};

const ALL_CENTERS: CenterId[] = ["Head", "Ajna", "Throat", "G", "Ego", "Spleen", "Solar Plexus", "Sacral", "Root"];

function uniqueSortedNumbers(values: number[]) {
  return [...new Set(values)].sort((a, b) => a - b);
}

function uniqueSortedStrings(values: string[]) {
  return [...new Set(values)].sort();
}

function canonicalChannelId(channel: ChannelDefinition): string {
  const first = Math.min(channel.gateA, channel.gateB);
  const second = Math.max(channel.gateA, channel.gateB);
  return `${first}-${second}`;
}

function buildCenterAdjacency(channels: ChannelDefinition[]) {
  const adjacency = new Map<CenterId, Set<CenterId>>();
  for (const center of ALL_CENTERS) adjacency.set(center, new Set());
  for (const channel of channels) {
    adjacency.get(channel.centerA)!.add(channel.centerB);
    adjacency.get(channel.centerB)!.add(channel.centerA);
  }
  return adjacency;
}

function connectedComponents(definedCenters: Set<CenterId>, definedChannels: ChannelDefinition[]): number {
  if (definedCenters.size === 0) return 0;
  const adjacency = buildCenterAdjacency(definedChannels);
  const seen = new Set<CenterId>();
  let components = 0;
  for (const start of definedCenters) {
    if (seen.has(start)) continue;
    components += 1;
    const stack: CenterId[] = [start];
    seen.add(start);
    while (stack.length) {
      const current = stack.pop()!;
      for (const next of adjacency.get(current) ?? []) {
        if (!definedCenters.has(next) || seen.has(next)) continue;
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return components;
}

function hasPath(start: CenterId, end: CenterId, definedCenters: Set<CenterId>, definedChannels: ChannelDefinition[]): boolean {
  if (!definedCenters.has(start) || !definedCenters.has(end)) return false;
  const adjacency = buildCenterAdjacency(definedChannels);
  const seen = new Set<CenterId>([start]);
  const stack: CenterId[] = [start];
  while (stack.length) {
    const current = stack.pop()!;
    if (current === end) return true;
    for (const next of adjacency.get(current) ?? []) {
      if (!definedCenters.has(next) || seen.has(next)) continue;
      seen.add(next);
      stack.push(next);
    }
  }
  return false;
}

function computeDefinition(components: number): CoreHumanDesignChart["definition"] {
  if (components === 0) return "No Definition";
  if (components === 1) return "Single Definition";
  if (components === 2) return "Split Definition";
  if (components === 3) return "Triple Split Definition";
  return "Quadruple Split Definition";
}

function computeType(definedCenters: Set<CenterId>, definedChannels: ChannelDefinition[]): CoreHumanDesignChart["type"] {
  if (definedCenters.size === 0) return "Reflector";

  const sacralDefined = definedCenters.has("Sacral");
  const motorCenters: CenterId[] = ["Sacral", "Solar Plexus", "Ego", "Root"];
  const motorConnectedToThroat = motorCenters.some((center) => hasPath(center, "Throat", definedCenters, definedChannels));

  if (sacralDefined) return motorConnectedToThroat ? "Manifesting Generator" : "Generator";
  if (motorConnectedToThroat) return "Manifestor";
  return "Projector";
}

function computeStrategy(type: CoreHumanDesignChart["type"]): CoreHumanDesignChart["strategy"] {
  if (type === "Reflector") return "Wait a Lunar Cycle";
  if (type === "Manifestor") return "Inform";
  if (type === "Projector") return "Wait for the Invitation";
  return "Wait to Respond";
}

function computeAuthority(type: CoreHumanDesignChart["type"], definedCenters: Set<CenterId>, definedChannels: ChannelDefinition[]): CoreHumanDesignChart["authority"] {
  if (type === "Reflector") return "Lunar";
  if (definedCenters.has("Solar Plexus")) return "Solar Plexus";
  if (definedCenters.has("Sacral")) return "Sacral";
  if (definedCenters.has("Spleen")) return "Splenic";

  if (definedCenters.has("Ego")) {
    if (hasPath("Ego", "Throat", definedCenters, definedChannels)) return "Ego Manifested";
    if (hasPath("Ego", "G", definedCenters, definedChannels)) return "Ego Projected";
  }

  if (definedCenters.has("G") && hasPath("G", "Throat", definedCenters, definedChannels)) return "Self-Projected";
  return "Mental / Environmental";
}

export function buildCoreHumanDesignChart(personality: HumanDesignActivation[], design: HumanDesignActivation[]): CoreHumanDesignChart {
  const activeGates = uniqueSortedNumbers([...personality, ...design].map((activation) => activation.gate));
  const gateSet = new Set(activeGates);
  const definedChannels = CHANNELS.filter((channel) => gateSet.has(channel.gateA) && gateSet.has(channel.gateB));
  const centers = new Set<CenterId>();
  for (const channel of definedChannels) {
    centers.add(channel.centerA);
    centers.add(channel.centerB);
  }

  const components = connectedComponents(centers, definedChannels);
  const type = computeType(centers, definedChannels);
  const personalitySun = personality.find((a) => a.body === "Sun");
  const designSun = design.find((a) => a.body === "Sun");
  const profile = personalitySun && designSun ? `${personalitySun.line}/${designSun.line}` : "";

  return {
    activeGates,
    // Canonical output format is always lowerGate-higherGate (e.g. 1-8,
    // 10-20, 47-64). Internal channel topology does not depend on ordering,
    // but stable IDs are required for Golden Test comparisons and renderers.
    channels: uniqueSortedStrings(definedChannels.map(canonicalChannelId)),
    centers: [...centers].sort(),
    definition: computeDefinition(components),
    type,
    strategy: computeStrategy(type),
    authority: computeAuthority(type, centers, definedChannels),
    profile,
  };
}
