import { NextRequest, NextResponse } from "next/server";
import { normalizeBirthTime } from "@/lib/human-design/time";
import { getPlanetaryLongitudes } from "@/lib/human-design/astronomy";
import { solveDesignMoment } from "@/lib/human-design/design-moment";
import {
  buildPreliminaryReferenceDiff,
  fetchHumanDesignHubReference,
} from "@/lib/human-design/hdhub-reference";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const localDateTime = String(body.localDateTime ?? "");
    const timezone = String(body.timezone ?? "");

    if (!localDateTime || !timezone) {
      return NextResponse.json(
        { error: "localDateTime and timezone are required" },
        { status: 400 },
      );
    }

    const normalized = normalizeBirthTime(localDateTime, timezone);
    const birthUtc = new Date(normalized.utcDateTime);
    const designMoment = solveDesignMoment(birthUtc);
    const designUtc = new Date(designMoment.utcDateTime);

    const selfCalculation = {
      engine: {
        name: "SelfHumanDesignAdapter",
        stage: "ephemeris-and-design-moment",
        astronomyEngine: "2.1.19",
        productionHumanDesignReady: false,
      },
      birthTime: normalized,
      personality: getPlanetaryLongitudes(birthUtc),
      designMoment,
      design: getPlanetaryLongitudes(designUtc),
    };

    const hdhubReference = await fetchHumanDesignHubReference(
      normalized.localDateTime,
    );
    const diff = buildPreliminaryReferenceDiff(
      selfCalculation as Record<string, unknown>,
      hdhubReference,
    );

    return NextResponse.json({
      selfCalculation,
      hdhubReference,
      diff,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown reference error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
