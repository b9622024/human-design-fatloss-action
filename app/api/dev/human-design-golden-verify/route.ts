import { NextRequest, NextResponse } from "next/server";
import { normalizeBirthTime } from "@/lib/human-design/time";
import { solveDesignMoment } from "@/lib/human-design/design-moment";
import { buildHumanDesignActivations } from "@/lib/human-design/activations";
import { buildCoreHumanDesignChart } from "@/lib/human-design/topology";
import {
  buildActivationReferenceDiff,
  fetchHumanDesignHubReference,
  HumanDesignHubRequestError,
} from "@/lib/human-design/hdhub-reference";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VerifyInput = {
  id?: string;
  localDateTime?: string;
  timezone?: string;
};

function compactReference(raw: unknown) {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  return {
    type: value.type ?? null,
    strategy: value.strategy ?? null,
    authority: value.authority ?? null,
    profile: value.profile ?? null,
    definition: value.definition ?? null,
    incarnationCross: value.incarnation_cross ?? null,
    gates: value.gates ?? null,
    channels: value.channels_short ?? null,
    centers: value.centers ?? null,
    gateAndLine: value.gate_and_line ?? null,
  };
}

function serializeError(error: unknown) {
  if (error instanceof HumanDesignHubRequestError) {
    return {
      kind: "HDHUB_HTTP_ERROR",
      message: error.message,
      httpStatus: error.status,
      requestDateTime: error.requestDateTime,
      responsePayload: error.payload,
    };
  }

  if (error instanceof Error) {
    return {
      kind: "APPLICATION_ERROR",
      message: error.message,
    };
  }

  return {
    kind: "UNKNOWN_ERROR",
    message: String(error),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const candidates = Array.isArray(body.candidates) ? (body.candidates as VerifyInput[]) : [];

    if (candidates.length === 0) {
      return NextResponse.json({ error: "At least one candidate is required" }, { status: 400 });
    }
    if (candidates.length > 9) {
      return NextResponse.json({ error: "A maximum of 9 candidates may be verified per request" }, { status: 400 });
    }

    const results = [];
    for (const candidate of candidates) {
      const id = candidate.id ?? null;
      const localDateTime = String(candidate.localDateTime ?? "");
      const timezone = String(candidate.timezone ?? "");

      try {
        if (!localDateTime || !timezone) {
          throw new Error(`Candidate ${id ?? "unknown"} is missing localDateTime/timezone`);
        }

        const normalized = normalizeBirthTime(localDateTime, timezone);
        const birthUtc = new Date(normalized.utcDateTime);
        const designMoment = solveDesignMoment(birthUtc);
        const designUtc = new Date(designMoment.utcDateTime);
        const personality = buildHumanDesignActivations(birthUtc);
        const design = buildHumanDesignActivations(designUtc);
        const coreChart = buildCoreHumanDesignChart(personality, design);
        const reference = await fetchHumanDesignHubReference(normalized.localDateTime);
        const diff = buildActivationReferenceDiff({ personality, design, reference, coreChart });

        results.push({
          id,
          ok: true,
          input: { localDateTime, timezone },
          birth: normalized,
          designMoment,
          self: coreChart,
          reference: compactReference(reference.raw),
          diff: {
            status: diff.status,
            activationAllMatch: diff.activationLayer.allMatch,
            activationMatched: diff.activationLayer.matched,
            activationTotal: diff.activationLayer.total,
            topologyAllMatch: diff.topologyLayer?.allMatch ?? false,
            topologyLayer: diff.topologyLayer,
          },
        });
      } catch (error) {
        results.push({
          id,
          ok: false,
          input: { localDateTime, timezone },
          error: serializeError(error),
        });
      }
    }

    const successful = results.filter((item) => item.ok);
    const failed = results.filter((item) => !item.ok);
    const matched = successful.filter(
      (item) => "diff" in item && item.diff.status === "CORE_CHART_MATCH",
    );

    return NextResponse.json({
      status:
        failed.length === 0 && matched.length === results.length
          ? "GOLDEN_BATCH_MATCH"
          : failed.length > 0
            ? "GOLDEN_BATCH_HAS_API_ERRORS"
            : "GOLDEN_BATCH_HAS_MISMATCH",
      requestedCount: candidates.length,
      apiAttempts: candidates.length,
      successCount: successful.length,
      errorCount: failed.length,
      coreChartMatchCount: matched.length,
      allMatch: failed.length === 0 && matched.length === results.length,
      results,
      note: "Each candidate is isolated. One HD Hub failure no longer aborts the batch; HTTP status and provider response payload are preserved for diagnosis.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Golden verification error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
