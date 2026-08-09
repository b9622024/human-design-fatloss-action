import type { HumanDesignActivation } from "@/lib/human-design/activations";
import { buildCoreHumanDesignChart, type CoreHumanDesignChart } from "@/lib/human-design/topology";

type ExpectedSubset = Partial<Pick<CoreHumanDesignChart,
  "type" | "strategy" | "authority" | "definition" | "channels" | "centers"
>>;

type SyntheticCase = {
  id: string;
  description: string;
  personalityGates: number[];
  designGates?: number[];
  expected: ExpectedSubset;
};

function activations(gates: number[], sunLine = 1): HumanDesignActivation[] {
  return gates.map((gate, index) => ({
    body: index === 0 ? "Sun" : "Moon",
    longitude: 0,
    gate,
    line: index === 0 ? sunLine : 1,
  })) as HumanDesignActivation[];
}

function canonicalStrings(values: string[] | undefined) {
  return values ? [...values].sort() : undefined;
}

function canonicalCenters(values: CoreHumanDesignChart["centers"] | undefined) {
  return values ? [...values].sort() : undefined;
}

export const SYNTHETIC_TOPOLOGY_CASES: SyntheticCase[] = [
  {
    id: "reflector-no-definition",
    description: "No complete channels => Reflector / Lunar / No Definition",
    personalityGates: [1],
    expected: { type: "Reflector", strategy: "Wait a Lunar Cycle", authority: "Lunar", definition: "No Definition", channels: [], centers: [] },
  },
  {
    id: "generator-sacral",
    description: "3-60 defines Sacral + Root without Throat connection",
    personalityGates: [3, 60],
    expected: { type: "Generator", strategy: "Wait to Respond", authority: "Sacral", definition: "Single Definition", channels: ["3-60"], centers: ["Root", "Sacral"] },
  },
  {
    id: "emotional-generator",
    description: "59-6 defines Sacral + Solar Plexus; Emotional authority takes precedence",
    personalityGates: [59, 6],
    expected: { type: "Generator", strategy: "Wait to Respond", authority: "Solar Plexus", definition: "Single Definition", channels: ["6-59"], centers: ["Sacral", "Solar Plexus"] },
  },
  {
    id: "manifesting-generator",
    description: "20-34 directly connects Sacral motor to Throat",
    personalityGates: [20, 34],
    expected: { type: "Manifesting Generator", strategy: "Wait to Respond", authority: "Sacral", definition: "Single Definition", channels: ["20-34"], centers: ["Sacral", "Throat"] },
  },
  {
    id: "ego-manifestor",
    description: "21-45 directly connects Ego motor to Throat with Sacral undefined",
    personalityGates: [21, 45],
    expected: { type: "Manifestor", strategy: "Inform", authority: "Ego Manifested", definition: "Single Definition", channels: ["21-45"], centers: ["Ego", "Throat"] },
  },
  {
    id: "splenic-projector",
    description: "20-57 defines Spleen + Throat without a motor",
    personalityGates: [20, 57],
    expected: { type: "Projector", strategy: "Wait for the Invitation", authority: "Splenic", definition: "Single Definition", channels: ["20-57"], centers: ["Spleen", "Throat"] },
  },
  {
    id: "emotional-projector",
    description: "19-49 defines Root + Solar Plexus without Throat",
    personalityGates: [19, 49],
    expected: { type: "Projector", strategy: "Wait for the Invitation", authority: "Solar Plexus", definition: "Single Definition", channels: ["19-49"], centers: ["Root", "Solar Plexus"] },
  },
  {
    id: "self-projected-projector",
    description: "1-8 defines G + Throat with no inner authority",
    personalityGates: [1, 8],
    expected: { type: "Projector", strategy: "Wait for the Invitation", authority: "Self-Projected", definition: "Single Definition", channels: ["1-8"], centers: ["G", "Throat"] },
  },
  {
    id: "ego-projected-projector",
    description: "25-51 defines G + Ego without a motor-to-Throat path",
    personalityGates: [25, 51],
    expected: { type: "Projector", strategy: "Wait for the Invitation", authority: "Ego Projected", definition: "Single Definition", channels: ["25-51"], centers: ["Ego", "G"] },
  },
  {
    id: "mental-projector",
    description: "47-64 defines only Head + Ajna",
    personalityGates: [47, 64],
    expected: { type: "Projector", strategy: "Wait for the Invitation", authority: "Mental / Environmental", definition: "Single Definition", channels: ["47-64"], centers: ["Ajna", "Head"] },
  },
  {
    id: "split-definition",
    description: "Two disconnected channel components produce Split Definition",
    personalityGates: [3, 60, 1, 8],
    expected: { type: "Generator", authority: "Sacral", definition: "Split Definition", channels: ["1-8", "3-60"], centers: ["G", "Root", "Sacral", "Throat"] },
  },
];

export function runSyntheticTopologySuite() {
  const cases = SYNTHETIC_TOPOLOGY_CASES.map((testCase) => {
    const personality = activations(testCase.personalityGates, 1);
    const design = activations(testCase.designGates ?? [], 3);
    const chart = buildCoreHumanDesignChart(personality, design);

    const checks: Record<string, boolean> = {};
    if (testCase.expected.type !== undefined) checks.type = chart.type === testCase.expected.type;
    if (testCase.expected.strategy !== undefined) checks.strategy = chart.strategy === testCase.expected.strategy;
    if (testCase.expected.authority !== undefined) checks.authority = chart.authority === testCase.expected.authority;
    if (testCase.expected.definition !== undefined) checks.definition = chart.definition === testCase.expected.definition;
    if (testCase.expected.channels !== undefined) {
      checks.channels = JSON.stringify(canonicalStrings(chart.channels)) === JSON.stringify(canonicalStrings(testCase.expected.channels));
    }
    if (testCase.expected.centers !== undefined) {
      checks.centers = JSON.stringify(canonicalCenters(chart.centers)) === JSON.stringify(canonicalCenters(testCase.expected.centers));
    }

    return {
      id: testCase.id,
      description: testCase.description,
      pass: Object.values(checks).every(Boolean),
      checks,
      expected: testCase.expected,
      actual: chart,
    };
  });

  return {
    suite: "synthetic-topology-v1",
    passed: cases.filter((item) => item.pass).length,
    total: cases.length,
    allPass: cases.every((item) => item.pass),
    cases,
  };
}
