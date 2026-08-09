import { NextRequest, NextResponse } from "next/server";
import { normalizeBirthTime } from "@/lib/human-design/time";
import { getPlanetaryLongitudes } from "@/lib/human-design/astronomy";
import { solveDesignMoment } from "@/lib/human-design/design-moment";
import { buildHumanDesignActivations } from "@/lib/human-design/activations";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const localDateTime = String(body.localDateTime ?? "");
    const timezone = String(body.timezone ?? "");

    if (!localDateTime || !timezone) {
      return NextResponse.json({ error: "localDateTime and timezone are required" }, { status: 400 });
    }

    const normalized = normalizeBirthTime(localDateTime, timezone);
    const birthUtc = new Date(normalized.utcDateTime);
    const designMoment = solveDesignMoment(birthUtc);
    const designUtc = new Date(designMoment.utcDateTime);

    return NextResponse.json({
      engine: {
        name: "SelfHumanDesignAdapter",
        stage: "activation-mapping",
        astronomyEngine: "2.1.19",
        raveMandalaMapping: "gate-41-origin-302deg-v1",
        nodePolicy: "true-node-meeus-perturbation-series",
        hdhubReferenceConfigured: Boolean(process.env.HDHUB_API_KEY),
        productionHumanDesignReady: false,
      },
      birthTime: normalized,
      personalityLongitudes: getPlanetaryLongitudes(birthUtc),
      personalityActivations: buildHumanDesignActivations(birthUtc),
      designMoment,
      designLongitudes: getPlanetaryLongitudes(designUtc),
      designActivations: buildHumanDesignActivations(designUtc),
      notYetImplemented: [
        "Channels/Centers",
        "Type/Strategy/Authority/Profile/Definition",
        "Incarnation Cross lookup validation",
        "Production Golden Test suite",
      ],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown calculation error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
