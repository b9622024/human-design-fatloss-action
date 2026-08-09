import { buildHumanDesignActivations, activationsToGateLineRecord } from "@/lib/human-design/activations";
import { solveDesignMoment } from "@/lib/human-design/design-moment";
import { normalizeBirthTime } from "@/lib/human-design/time";
import { buildCoreHumanDesignChart } from "@/lib/human-design/topology";

type GateLineRecord = Record<string, [number, number]>;

type GoldenCase = {
  id: string;
  label: string;
  localDateTime: string;
  timezone: string;
  expected: {
    personality: GateLineRecord;
    design: GateLineRecord;
    core: {
      activeGates: number[];
      channels: string[];
      centers: string[];
      type: string;
      strategy: string;
      authority: string;
      profile: string;
      definition: string;
    };
  };
};

export const GOLDEN_CASES: GoldenCase[] = [
  {
    id: "GOLDEN-001",
    label: "1989-01-17 11:45 Asia/Taipei",
    localDateTime: "1989-01-17T11:45",
    timezone: "Asia/Taipei",
    expected: {
      personality: {
        Sun: [60, 1], Earth: [56, 1], Moon: [8, 6], NorthNode: [55, 6],
        Mercury: [19, 5], Venus: [58, 5], Mars: [3, 3], Jupiter: [8, 2],
        Saturn: [58, 4], Uranus: [10, 5], Neptune: [38, 2], Pluto: [1, 2], SouthNode: [59, 6],
      },
      design: {
        Sun: [50, 3], Earth: [3, 3], Moon: [22, 1], NorthNode: [63, 3],
        Mercury: [48, 3], Venus: [47, 4], Mars: [25, 2], Jupiter: [20, 6],
        Saturn: [11, 6], Uranus: [11, 6], Neptune: [58, 5], Pluto: [44, 5], SouthNode: [64, 3],
      },
      core: {
        activeGates: [1, 3, 8, 10, 11, 19, 20, 22, 25, 38, 44, 47, 48, 50, 55, 56, 58, 59, 60, 63, 64],
        channels: ["1-8", "10-20", "11-56", "3-60", "47-64"],
        centers: ["Ajna", "G", "Head", "Root", "Sacral", "Throat"],
        type: "Generator",
        strategy: "Wait to Respond",
        authority: "Sacral",
        profile: "1/3",
        definition: "Split Definition",
      },
    },
  },
];

function canonical<T extends string | number>(values: T[]) {
  return [...values].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
}

function equalJson(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function compareGateLines(actual: GateLineRecord, expected: GateLineRecord) {
  const bodies = Object.keys(expected);
  const rows = bodies.map((body) => ({
    body,
    actual: actual[body] ?? null,
    expected: expected[body],
    match: equalJson(actual[body] ?? null, expected[body]),
  }));
  return {
    matched: rows.filter((row) => row.match).length,
    total: rows.length,
    allMatch: rows.every((row) => row.match),
    rows,
  };
}

export function runOfflineGoldenCase(testCase: GoldenCase) {
  const normalized = normalizeBirthTime(testCase.localDateTime, testCase.timezone);
  const birthUtc = new Date(normalized.utcDateTime);
  const designMoment = solveDesignMoment(birthUtc);
  const designUtc = new Date(designMoment.utcDateTime);
  const personality = buildHumanDesignActivations(birthUtc);
  const design = buildHumanDesignActivations(designUtc);
  const core = buildCoreHumanDesignChart(personality, design);

  const personalityDiff = compareGateLines(activationsToGateLineRecord(personality), testCase.expected.personality);
  const designDiff = compareGateLines(activationsToGateLineRecord(design), testCase.expected.design);

  const coreChecks = {
    activeGates: equalJson(core.activeGates, testCase.expected.core.activeGates),
    channels: equalJson(canonical(core.channels), canonical(testCase.expected.core.channels)),
    centers: equalJson(canonical(core.centers), canonical(testCase.expected.core.centers)),
    type: core.type === testCase.expected.core.type,
    strategy: core.strategy === testCase.expected.core.strategy,
    authority: core.authority === testCase.expected.core.authority,
    profile: core.profile === testCase.expected.core.profile,
    definition: core.definition === testCase.expected.core.definition,
  };

  const pass = personalityDiff.allMatch && designDiff.allMatch && Object.values(coreChecks).every(Boolean);

  return {
    id: testCase.id,
    label: testCase.label,
    pass,
    source: "frozen-hdhub-reference-snapshot",
    birthTime: normalized,
    designMoment,
    activationLayer: {
      personality: personalityDiff,
      design: designDiff,
      matched: personalityDiff.matched + designDiff.matched,
      total: personalityDiff.total + designDiff.total,
      allMatch: personalityDiff.allMatch && designDiff.allMatch,
    },
    topologyLayer: {
      checks: coreChecks,
      allMatch: Object.values(coreChecks).every(Boolean),
      actual: core,
      expected: testCase.expected.core,
    },
  };
}

export function runOfflineGoldenSuite() {
  const cases = GOLDEN_CASES.map(runOfflineGoldenCase);
  return {
    suite: "offline-golden-v1",
    passed: cases.filter((item) => item.pass).length,
    total: cases.length,
    allPass: cases.every((item) => item.pass),
    cases,
  };
}
