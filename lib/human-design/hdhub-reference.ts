import { HumanDesignActivation, activationsToGateLineRecord } from "@/lib/human-design/activations";

export const HDHUB_SIMPLE_BODYGRAPH_URL =
  "https://api.humandesignhub.app/v2/simple-bodygraph";

export type HumanDesignHubReferenceResult = {
  source: "HumanDesignHub";
  endpoint: "/v2/simple-bodygraph";
  requestDateTime: string;
  fetchedAt: string;
  raw: unknown;
};

function requireApiKey(): string {
  const apiKey = process.env.HDHUB_API_KEY;
  if (!apiKey) {
    throw new Error("HDHUB_API_KEY is not configured on the server");
  }
  return apiKey;
}

export async function fetchHumanDesignHubReference(
  offsetDateTime: string,
): Promise<HumanDesignHubReferenceResult> {
  const response = await fetch(HDHUB_SIMPLE_BODYGRAPH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": requireApiKey(),
    },
    body: JSON.stringify({ datetime: offsetDateTime }),
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
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: unknown }).message ?? "")
        : "";
    throw new Error(
      `Human Design Hub request failed (${response.status})${message ? `: ${message}` : ""}`,
    );
  }

  return {
    source: "HumanDesignHub",
    endpoint: "/v2/simple-bodygraph",
    requestDateTime: offsetDateTime,
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
    return {
      body,
      self: selfValue,
      reference: referenceValue,
      match,
    };
  });
  return {
    rows,
    matched: rows.filter((row) => row.match).length,
    total: rows.length,
    allMatch: rows.every((row) => row.match),
  };
}

export function buildActivationReferenceDiff(args: {
  personality: HumanDesignActivation[];
  design: HumanDesignActivation[];
  reference: HumanDesignHubReferenceResult;
}) {
  const referenceGateLines = extractGateAndLine(args.reference);
  const personality = compareSide(args.personality, referenceGateLines.personality);
  const design = compareSide(args.design, referenceGateLines.design);
  const raw =
    args.reference.raw && typeof args.reference.raw === "object"
      ? (args.reference.raw as Record<string, unknown>)
      : {};

  return {
    status:
      personality.allMatch && design.allMatch
        ? "ACTIVATION_LAYER_MATCH"
        : "ACTIVATION_LAYER_MISMATCH",
    activationLayer: {
      personality,
      design,
      matched: personality.matched + design.matched,
      total: personality.total + design.total,
      allMatch: personality.allMatch && design.allMatch,
    },
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
    pendingTopologyComparison: [
      "type",
      "strategy",
      "authority",
      "profile",
      "definition",
      "active_gates",
      "channels",
      "centers",
    ],
  };
}
