import { normalizeBirthTime } from "@/lib/human-design/time";
import { solveDesignMoment } from "@/lib/human-design/design-moment";
import { buildHumanDesignActivations } from "@/lib/human-design/activations";
import { buildCoreHumanDesignChart, type CoreHumanDesignChart } from "@/lib/human-design/topology";

export type GoldenCandidate = {
  id: string;
  localDateTime: string;
  timezone: string;
  utcDateTime: string;
  designUtcDateTime: string;
  chart: CoreHumanDesignChart;
};

const TIMEZONES = ["Asia/Taipei", "America/New_York", "Europe/London", "Asia/Tokyo"] as const;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function addDaysUTC(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400000);
}

function buildCandidate(index: number): { localDateTime: string; timezone: string } {
  // Deterministic, non-personal test vectors. Noon avoids DST ambiguous/nonexistent local times.
  const date = addDaysUTC(new Date("1984-01-01T00:00:00Z"), index * 23);
  const hour = 10 + (index % 5);
  const minute = (index * 17) % 60;
  const localDateTime = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(hour)}:${pad(minute)}`;
  return { localDateTime, timezone: TIMEZONES[index % TIMEZONES.length] };
}

export function calculateGoldenCandidate(index: number): GoldenCandidate {
  const input = buildCandidate(index);
  const normalized = normalizeBirthTime(input.localDateTime, input.timezone);
  const birthUtc = new Date(normalized.utcDateTime);
  const designMoment = solveDesignMoment(birthUtc);
  const designUtc = new Date(designMoment.utcDateTime);
  const personality = buildHumanDesignActivations(birthUtc);
  const design = buildHumanDesignActivations(designUtc);
  const chart = buildCoreHumanDesignChart(personality, design);

  return {
    id: `DISCOVERY-${String(index + 1).padStart(3, "0")}`,
    localDateTime: normalized.localDateTime,
    timezone: normalized.timezone,
    utcDateTime: normalized.utcDateTime,
    designUtcDateTime: designMoment.utcDateTime,
    chart,
  };
}

export function discoverGoldenCandidates(maxScan = 320, targetCount = 8) {
  const selected: GoldenCandidate[] = [];
  const seenTypes = new Set<string>();
  const seenAuthorities = new Set<string>();
  const seenDefinitions = new Set<string>();

  for (let index = 0; index < maxScan; index += 1) {
    const candidate = calculateGoldenCandidate(index);
    const novelty =
      !seenTypes.has(candidate.chart.type) ||
      !seenAuthorities.has(candidate.chart.authority) ||
      !seenDefinitions.has(candidate.chart.definition);

    if (!novelty && selected.length >= targetCount) continue;

    if (novelty) {
      selected.push(candidate);
      seenTypes.add(candidate.chart.type);
      seenAuthorities.add(candidate.chart.authority);
      seenDefinitions.add(candidate.chart.definition);
    }

    const hasAllTypes = ["Generator", "Manifesting Generator", "Projector", "Manifestor", "Reflector"].every((type) => seenTypes.has(type));
    if (selected.length >= targetCount && hasAllTypes) break;
  }

  return {
    scanned: maxScan,
    selected: selected.slice(0, Math.max(targetCount, selected.length)),
    coverage: {
      types: [...seenTypes].sort(),
      authorities: [...seenAuthorities].sort(),
      definitions: [...seenDefinitions].sort(),
    },
    note: "Discovery uses SelfHumanDesignAdapter only and consumes zero Human Design Hub credits. Candidates are deterministic test vectors, not personal birth records.",
  };
}
