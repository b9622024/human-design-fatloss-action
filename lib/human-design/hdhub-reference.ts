import { HumanDesignActivation, activationsToGateLineRecord } from "@/lib/human-design/activations";
import type { CoreHumanDesignChart } from "@/lib/human-design/topology";

export const HDHUB_SIMPLE_BODYGRAPH_URL =
  "https://api.humandesignhub.app/v2/simple-bodygraph";

export type HumanDesignHubReferenceResult = {
  source: "HumanDesignHub";
  endpoint: "/v2/simple-bodygraph";
  requestDateTime: string;
  fetchedAt: string;
  raw: unknown;
};

export class HumanDesignHubRequestError extends Error {
  status: number;
  payload: unknown;
  requestDateTime: string;

  constructor(args: {
    status: number;
    payload: unknown;
    requestDateTime: string;
    message?: string;
  }) {
    super(
      `Human Design Hub request failed (${args.status})${args.message ? `: ${args.message}` : ""}`,
    );
    this.name = "HumanDesignHubRequestError";
    this.status = args.status;
    this.payload = args.payload;
    this.requestDateTime = args.requestDateTime;
  }
}

function requireApiKey(): string {
  const apiKey = process.env.HDHUB_API_KEY;
  if (!apiKey) {
    throw new Error("HDHUB_API_KEY is not configured on the server");
  }
  return apiKey;
}

function extractApiMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const value = payload as Record<string, unknown>;
  for (const key of ["message", "detail", "error", "error_description"]) {
    const candidate = value[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }
  return "";
}

function normalizeDateTimeForHdHub(value: string): string {
  // HD Hub currently rejects ISO strings ending in Z and expects an explicit
  // numeric UTC offset, e.g. +00:00. Preserve all non-zero offsets unchanged.
  return value.endsWith("Z") ? `${value.slice(0, -1)}+00:00` : value;
}

function normalizeAuthorityLabel(value: unknown, chartType?: string): string | null {
  if (value === null || value === undefined) return null;
  const label = String(value);

  // HD Hub and this project use different display labels for several
  // semantically identical authority branches. Normalize provider labels to
  // the project's canonical internal vocabulary before comparing topology.
  if (label === "Emotional") return "Solar Plexus";
  if (label === "Sounding Board") return "Mental / Environmental";
  if (label === "Ego") {
    if (chartType === "Manifestor") return "Ego Manifested";
    if (chartType === "Projector") return "Ego Projected";
  }
  return label;
}

export async function fetchHumanDesignHubReference(
  offsetDateTime: string,
): Promise<HumanDesignHubReferenceResult> {
  const requestDateTime = normalizeDateTimeForHdHub(offsetDateTime);
  const response = await fetch(HDHUB_SIMPLE_BODYGRAPH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": requireApiKey(),
    },
    body: JSON.stringify({ datetime: requestDateTime }),
    cache: "no-store",
  });

  const responseText = await response.text();
  let payload: unknown = null;

  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = { rawText: responseText };
    }
  }

  if (!response.ok) {
    throw new HumanDesignHubRequestError({
      status: response.status,
      payload,
      requestDateTime,
      message: extractApiMessage(payload),
    });
  }

  return {
    source: "HumanDesignHub",
    endpoint: "/v2/simple-bodygraph",
    requestDateTime,
    fetchedAt: new Date().toISOString(),
    raw: payload,
  };
}

type GateLineMap = Record<string, [number, number]>;

function extractGateAndLine(reference: HumanDesignHubReferenceResult): {
  personality?: GateLineMap;
  design?: GateLineMap;
} {
  if (!reference.raw || typeof reference.raw !== "object") return {};
  const raw = reference.raw as Record<string, unknown>;
  const gateAndLine = raw.gate_and_line;
  if (!gateAndLine || typeof gateAndLine !== "object") return {};
  const pair = gateAndLine as Record<string, unknown>;
  return {
    personality:
      pair.personality && typeof pair.personality === "object"
        ? (pair.personality as GateLineMap)
        : undefined,
    design:
      pair.design && typeof pair.design === "object"
        ? (pair.design as GateLineMap)
        : undefined,
  };
}

function compareSide(self: HumanDesignActivation[], reference?: GateLineMap) {
  const selfMap = activationsToGateLineRecord(self);
  const bodies = Object.keys(selfMap);
  const rows = bodies.map((body) => {
    const selfValue = selfMap[body];
    const referenceValue = reference?.[body] ?? null;
    const match =
      referenceValue !== null &&
      selfValue[0] === referenceValue[0] &&
      selfValue[1] === referenceValue[1];
    return { body, self: selfValue, reference: referenceValue, match };
  });
  return {
    rows,
    matched: rows.filter((row) => row.match).length,
    total: rows.length,
    allMatch: rows.every((row) => row.match),
  };
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).sort();
}

function normalizeNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export function buildActivationReferenceDiff(args: {
  personality: HumanDesignActivation[];
  design: HumanDesignActivation[];
  reference: HumanDesignHubReferenceResult;
  coreChart?: CoreHumanDesignChart;
}) {
  const referenceGateLines = extractGateAndLine(args.reference);
  const personality = compareSide(args.personality, referenceGateLines.personality);
  const design = compareSide(args.design, referenceGateLines.design);
  const raw =
    args.reference.raw && typeof args.reference.raw === "object"
      ? (args.reference.raw as Record<string, unknown>)
      : {};

  const activationAllMatch = personality.allMatch && design.allMatch;
  const normalizedReferenceAuthority = normalizeAuthorityLabel(
    raw.authority,
    args.coreChart?.type,
  );
  const topology = args.coreChart
    ? {
        activeGates: {
          self: args.coreChart.activeGates,
          reference: normalizeNumberArray(raw.gates),
          match: arraysEqual(args.coreChart.activeGates, normalizeNumberArray(raw.gates)),
        },
        channels: {
          self: [...args.coreChart.channels].sort(),
          reference: normalizeStringArray(raw.channels_short),
          match: arraysEqual([...args.coreChart.channels].sort(), normalizeStringArray(raw.channels_short)),
        },
        centers: {
          self: [...args.coreChart.centers].sort(),
          reference: normalizeStringArray(raw.centers),
          match: arraysEqual([...args.coreChart.centers].sort(), normalizeStringArray(raw.centers)),
        },
        type: { self: args.coreChart.type, reference: raw.type ?? null, match: args.coreChart.type === raw.type },
        strategy: { self: args.coreChart.strategy, reference: raw.strategy ?? null, match: args.coreChart.strategy === raw.strategy },
        authority: {
          self: args.coreChart.authority,
          reference: raw.authority ?? null,
          normalizedReference: normalizedReferenceAuthority,
          match: args.coreChart.authority === normalizedReferenceAuthority,
        },
        profile: { self: args.coreChart.profile, reference: raw.profile ?? null, match: args.coreChart.profile === raw.profile },
        definition: { self: args.coreChart.definition, reference: raw.definition ?? null, match: args.coreChart.definition === raw.definition },
      }
    : null;

  const topologyAllMatch = topology
    ? Object.values(topology).every((item) => item.match)
    : false;

  return {
    status:
      activationAllMatch && topologyAllMatch
        ? "CORE_CHART_MATCH"
        : activationAllMatch
          ? "ACTIVATION_MATCH_TOPOLOGY_MISMATCH"
          : "ACTIVATION_LAYER_MISMATCH",
    activationLayer: {
      personality,
      design,
      matched: personality.matched + design.matched,
      total: personality.total + design.total,
      allMatch: activationAllMatch,
    },
    topologyLayer: topology
      ? {
          ...topology,
          allMatch: topologyAllMatch,
          validationBlockedByActivationMismatch: !activationAllMatch,
        }
      : null,
    referenceChartSummary: {
      type: raw.type ?? null,
      strategy: raw.strategy ?? null,
      authority: raw.authority ?? null,
      profile: raw.profile ?? null,
      definition: raw.definition ?? null,
      gates: raw.gates ?? null,
      channels: raw.channels_short ?? null,
      centers: raw.centers ?? null,
    },
  };
}
