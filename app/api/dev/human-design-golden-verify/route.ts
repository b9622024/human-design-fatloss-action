import { NextRequest, NextResponse } from "next/server";
import { normalizeBirthTime } from "@/lib/human-design/time";
import { solveDesignMoment } from "@/lib/human-design/design-moment";
import { buildHumanDesignActivations } from "@/lib/human-design/activations";
import { buildCoreHumanDesignChart } from "@/lib/human-design/topology";
import { buildActivationReferenceDiff, fetchHumanDesignHubReference } from "@/lib/human-design/hdhub-reference";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const candidates = Array.isArray(body.candidates) ? (body.candidates as VerifyInput[]) : [];

    if (candidates.length === 0) {
      return NextResponse.json({ error: "At least one candidate is required" }, { status: 400 });
    }
    if (candidates.length > 8) {
      return NextResponse.json({ error: "A maximum of 8 candidates may be verified per request" }, { status: 400 });
    }

    const results = [];
    for (const candidate of candidates) {
      const localDateTime = String(candidate.localDateTime ?? "");
      const timezone = String(candidate.timezone ?? "");
      if (!localDateTime || !timezone) {
        throw new Error(`Candidate ${candidate.id ?? "unknown"} is missing localDateTime/timezone`);
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
        id: candidate.id ?? null,
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
    }

    return NextResponse.json({
      status: results.every((item) => item.diff.status === "CORE_CHART_MATCH") ? "GOLDEN_BATCH_MATCH" : "GOLDEN_BATCH_HAS_MISMATCH",
      verifiedCount: results.length,
      apiCallsUsed: results.length,
      allMatch: results.every((item) => item.diff.status === "CORE_CHART_MATCH"),
      results,
      note: "This endpoint calls Human Design Hub once per selected candidate. Results are compact snapshots suitable for freezing into offline Golden tests after review.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Golden verification error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
