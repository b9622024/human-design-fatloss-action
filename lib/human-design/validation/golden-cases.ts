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
    id: "GOLDEN-001", label: "1989-01-17 11:45 Asia/Taipei", localDateTime: "1989-01-17T11:45", timezone: "Asia/Taipei",
    expected: {
      personality: { Sun:[60,1], Earth:[56,1], Moon:[8,6], NorthNode:[55,6], Mercury:[19,5], Venus:[58,5], Mars:[3,3], Jupiter:[8,2], Saturn:[58,4], Uranus:[10,5], Neptune:[38,2], Pluto:[1,2], SouthNode:[59,6] },
      design: { Sun:[50,3], Earth:[3,3], Moon:[22,1], NorthNode:[63,3], Mercury:[48,3], Venus:[47,4], Mars:[25,2], Jupiter:[20,6], Saturn:[11,6], Uranus:[11,6], Neptune:[58,5], Pluto:[44,5], SouthNode:[64,3] },
      core: { activeGates:[1,3,8,10,11,19,20,22,25,38,44,47,48,50,55,56,58,59,60,63,64], channels:["1-8","10-20","11-56","3-60","47-64"], centers:["Ajna","G","Head","Root","Sacral","Throat"], type:"Generator", strategy:"Wait to Respond", authority:"Sacral", profile:"1/3", definition:"Split Definition" },
    },
  },
  {
    id: "GOLDEN-002", label: "1984-01-01 10:00 Asia/Taipei", localDateTime: "1984-01-01T10:00:00+08:00", timezone: "Asia/Taipei",
    expected: {
      personality: { Sun:[38,1], Earth:[39,1], Moon:[5,5], NorthNode:[35,5], Mercury:[58,5], Venus:[14,6], Mars:[32,5], Jupiter:[11,4], Saturn:[1,1], Uranus:[9,6], Neptune:[10,2], Pluto:[50,6], SouthNode:[5,5] },
      design: { Sun:[48,3], Earth:[21,3], Moon:[46,3], NorthNode:[45,2], Mercury:[6,3], Venus:[29,6], Mars:[59,4], Jupiter:[9,2], Saturn:[28,3], Uranus:[9,1], Neptune:[11,5], Pluto:[50,3], SouthNode:[26,2] },
      core: { activeGates:[1,5,6,9,10,11,14,21,26,28,29,32,35,38,39,45,46,48,50,58,59], channels:["21-45","28-38","29-46","6-59"], centers:["Ego","G","Root","Sacral","Solar Plexus","Spleen","Throat"], type:"Manifesting Generator", strategy:"Wait to Respond", authority:"Solar Plexus", profile:"1/3", definition:"Triple Split Definition" },
    },
  },
  {
    id: "GOLDEN-003", label: "1984-01-24 11:17 America/New_York", localDateTime: "1984-01-24T11:17:00-05:00", timezone: "America/New_York",
    expected: {
      personality: { Sun:[41,2], Earth:[31,2], Moon:[50,1], NorthNode:[35,4], Mercury:[38,1], Venus:[10,1], Mars:[28,6], Jupiter:[10,4], Saturn:[1,3], Uranus:[5,2], Neptune:[10,3], Pluto:[28,1], SouthNode:[5,4] },
      design: { Sun:[28,5], Earth:[27,5], Moon:[7,3], NorthNode:[35,6], Mercury:[28,4], Venus:[47,3], Mars:[47,2], Jupiter:[5,1], Saturn:[28,6], Uranus:[9,2], Neptune:[11,5], Pluto:[50,4], SouthNode:[5,6] },
      core: { activeGates:[1,5,7,9,10,11,27,28,31,35,38,41,47,50], channels:["27-50","28-38","7-31"], centers:["G","Root","Sacral","Spleen","Throat"], type:"Generator", strategy:"Wait to Respond", authority:"Sacral", profile:"2/5", definition:"Split Definition" },
    },
  },
  {
    id: "GOLDEN-004", label: "1984-02-16 12:34 Europe/London", localDateTime: "1984-02-16T12:34:00+00:00", timezone: "Europe/London",
    expected: {
      personality: { Sun:[30,3], Earth:[29,3], Moon:[4,1], NorthNode:[35,2], Mercury:[19,4], Venus:[60,1], Mars:[1,4], Jupiter:[58,2], Saturn:[1,4], Uranus:[5,2], Neptune:[10,3], Pluto:[28,1], SouthNode:[5,2] },
      design: { Sun:[14,5], Earth:[8,5], Moon:[35,6], NorthNode:[35,5], Mercury:[5,1], Venus:[48,5], Mars:[46,5], Jupiter:[5,6], Saturn:[44,3], Uranus:[9,4], Neptune:[11,6], Pluto:[50,5], SouthNode:[5,5] },
      core: { activeGates:[1,4,5,8,9,10,11,14,19,28,29,30,35,44,46,48,50,58,60], channels:["1-8","29-46"], centers:["G","Sacral","Throat"], type:"Manifesting Generator", strategy:"Wait to Respond", authority:"Sacral", profile:"3/5", definition:"Single Definition" },
    },
  },
  {
    id: "GOLDEN-005", label: "1984-03-10 13:51 Asia/Tokyo", localDateTime: "1984-03-10T13:51:00+09:00", timezone: "Asia/Tokyo",
    expected: {
      personality: { Sun:[22,3], Earth:[47,3], Moon:[35,2], NorthNode:[16,5], Mercury:[22,5], Venus:[30,1], Mars:[14,1], Jupiter:[58,6], Saturn:[1,4], Uranus:[5,3], Neptune:[10,4], Pluto:[50,6], SouthNode:[9,5] },
      design: { Sun:[26,6], Earth:[45,6], Moon:[21,3], NorthNode:[35,5], Mercury:[38,4], Venus:[44,2], Mars:[48,6], Jupiter:[26,6], Saturn:[44,5], Uranus:[9,5], Neptune:[10,1], Pluto:[50,6], SouthNode:[5,5] },
      core: { activeGates:[1,5,9,10,14,16,21,22,26,30,35,38,44,45,47,48,50,58], channels:["16-48","21-45","26-44"], centers:["Ego","Spleen","Throat"], type:"Manifestor", strategy:"Inform", authority:"Splenic", profile:"3/6", definition:"Single Definition" },
    },
  },
  {
    id: "GOLDEN-006", label: "1984-12-11 10:15 Asia/Tokyo", localDateTime: "1984-12-11T10:15:00+09:00", timezone: "Asia/Tokyo",
    expected: {
      personality: { Sun:[26,3], Earth:[45,3], Moon:[53,6], NorthNode:[8,4], Mercury:[11,6], Venus:[41,1], Mars:[49,1], Jupiter:[54,2], Saturn:[43,4], Uranus:[5,3], Neptune:[10,3], Pluto:[28,2], SouthNode:[14,4] },
      design: { Sun:[47,5], Earth:[22,5], Moon:[3,4], NorthNode:[8,6], Mercury:[59,4], Venus:[57,1], Mars:[5,5], Jupiter:[10,6], Saturn:[44,6], Uranus:[9,5], Neptune:[10,1], Pluto:[50,5], SouthNode:[14,6] },
      core: { activeGates:[3,5,8,9,10,11,14,22,26,28,41,43,44,45,47,49,50,53,54,57,59], channels:["10-57","26-44"], centers:["Ego","G","Spleen"], type:"Projector", strategy:"Wait for the Invitation", authority:"Splenic", profile:"3/5", definition:"Single Definition" },
    },
  },
  {
    id: "GOLDEN-007", label: "1985-01-26 12:49 America/New_York", localDateTime: "1985-01-26T12:49:00-05:00", timezone: "America/New_York",
    expected: {
      personality: { Sun:[41,6], Earth:[31,6], Moon:[21,2], NorthNode:[23,6], Mercury:[61,1], Venus:[36,2], Mars:[36,3], Jupiter:[60,2], Saturn:[14,3], Uranus:[5,6], Neptune:[10,5], Pluto:[28,3], SouthNode:[43,6] },
      design: { Sun:[44,2], Earth:[24,2], Moon:[13,1], NorthNode:[8,4], Mercury:[43,4], Venus:[5,4], Mars:[54,5], Jupiter:[58,6], Saturn:[1,5], Uranus:[5,1], Neptune:[10,2], Pluto:[28,1], SouthNode:[14,4] },
      core: { activeGates:[1,5,8,10,13,14,21,23,24,28,31,36,41,43,44,54,58,60,61], channels:["1-8","23-43","24-61"], centers:["Ajna","G","Head","Throat"], type:"Projector", strategy:"Wait for the Invitation", authority:"Self-Projected", profile:"6/2", definition:"Single Definition" },
    },
  },
  {
    id: "GOLDEN-008", label: "1988-03-21 12:59 Asia/Tokyo", localDateTime: "1988-03-21T12:59:00+09:00", timezone: "Asia/Tokyo",
    expected: {
      personality: { Sun:[25,3], Earth:[46,3], Moon:[24,5], NorthNode:[36,1], Mercury:[37,1], Venus:[2,4], Mars:[54,4], Jupiter:[27,1], Saturn:[10,5], Uranus:[10,3], Neptune:[38,1], Pluto:[44,5], SouthNode:[6,1] },
      design: { Sun:[10,5], Earth:[15,5], Moon:[55,3], NorthNode:[36,5], Mercury:[10,6], Venus:[41,2], Mars:[43,2], Jupiter:[51,6], Saturn:[11,3], Uranus:[11,5], Neptune:[58,4], Pluto:[44,5], SouthNode:[6,5] },
      core: { activeGates:[2,6,10,11,15,24,25,27,36,37,38,41,43,44,46,51,54,55,58], channels:["25-51"], centers:["Ego","G"], type:"Projector", strategy:"Wait for the Invitation", authority:"Ego Projected", profile:"3/5", definition:"Single Definition" },
    },
  },
  {
    id: "GOLDEN-009", label: "1988-06-21 11:07 Asia/Tokyo", localDateTime: "1988-06-21T11:07:00+09:00", timezone: "Asia/Tokyo",
    expected: {
      personality: { Sun:[15,2], Earth:[10,2], Moon:[64,5], NorthNode:[22,1], Mercury:[45,2], Venus:[45,1], Mars:[22,2], Jupiter:[23,6], Saturn:[10,2], Uranus:[10,1], Neptune:[58,6], Pluto:[44,3], SouthNode:[47,1] },
      design: { Sun:[25,4], Earth:[46,4], Moon:[8,5], NorthNode:[36,1], Mercury:[37,3], Venus:[2,5], Mars:[54,5], Jupiter:[27,2], Saturn:[10,5], Uranus:[10,3], Neptune:[38,1], Pluto:[44,5], SouthNode:[6,1] },
      core: { activeGates:[2,6,8,10,15,22,23,25,27,36,37,38,44,45,46,47,54,58,64], channels:["47-64"], centers:["Ajna","Head"], type:"Projector", strategy:"Wait for the Invitation", authority:"Mental / Environmental", profile:"2/4", definition:"Single Definition" },
    },
  },
  {
    id: "GOLDEN-010", label: "1988-10-14 11:32 Asia/Taipei", localDateTime: "1988-10-14T11:32:00+08:00", timezone: "Asia/Taipei",
    expected: {
      personality: { Sun:[32,1], Earth:[42,1], Moon:[14,4], NorthNode:[63,3], Mercury:[48,6], Venus:[40,6], Mars:[25,4], Jupiter:[20,6], Saturn:[11,6], Uranus:[11,6], Neptune:[58,4], Pluto:[44,5], SouthNode:[64,3] },
      design: { Sun:[62,3], Earth:[61,3], Moon:[33,1], NorthNode:[63,5], Mercury:[52,1], Venus:[35,5], Mars:[25,3], Jupiter:[8,5], Saturn:[11,6], Uranus:[11,6], Neptune:[58,5], Pluto:[44,3], SouthNode:[64,5] },
      core: { activeGates:[8,11,14,20,25,32,33,35,40,42,44,48,52,58,61,62,63,64], channels:[], centers:[], type:"Reflector", strategy:"Wait a Lunar Cycle", authority:"Lunar", profile:"1/3", definition:"No Definition" },
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
    suite: "offline-golden-v2-10charts",
    passed: cases.filter((item) => item.pass).length,
    total: cases.length,
    allPass: cases.every((item) => item.pass),
    cases,
  };
}
