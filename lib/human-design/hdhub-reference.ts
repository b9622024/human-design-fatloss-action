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

export function buildPreliminaryReferenceDiff(
  selfCalculation: Record<string, unknown>,
  reference: HumanDesignHubReferenceResult,
) {
  return {
    status: "REFERENCE_CONNECTED_SELF_MAPPING_PENDING",
    requestDateTimeMatch:
      (selfCalculation.birthTime as { localDateTime?: string } | undefined)
        ?.localDateTime === reference.requestDateTime,
    comparableNow: {
      timezoneNormalization: true,
      referenceApiConnectivity: true,
    },
    pendingUntilSelfEngineImplementsMapping: [
      "type",
      "strategy",
      "authority",
      "profile",
      "definition",
      "active_gates",
      "channels",
      "centers",
    ],
    note:
      "HD Hub raw response is intentionally preserved. Formal field-by-field diff will be enabled only after the self engine implements Rave Mandala Gate/Line mapping and chart topology rules.",
  };
}
