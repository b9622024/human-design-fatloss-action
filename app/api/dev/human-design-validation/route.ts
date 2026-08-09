import { NextResponse } from "next/server";
import { runSyntheticTopologySuite } from "@/lib/human-design/validation/topology-suite";
import { runOfflineGoldenSuite } from "@/lib/human-design/validation/golden-cases";

export const runtime = "nodejs";

export async function GET() {
  try {
    const syntheticTopology = runSyntheticTopologySuite();
    const offlineGolden = runOfflineGoldenSuite();
    const allPass = syntheticTopology.allPass && offlineGolden.allPass;

    return NextResponse.json({
      status: allPass ? "VALIDATION_SUITE_PASS" : "VALIDATION_SUITE_FAIL",
      allPass,
      note: "This suite does not call Human Design Hub and consumes zero API credits. GOLDEN-001 is compared against a frozen HD Hub reference snapshot that was previously verified as CORE_CHART_MATCH.",
      syntheticTopology,
      offlineGolden,
      nextGate: allPass
        ? "Add more real Golden Charts across Types / Authorities / Definitions before production readiness."
        : "Fix failing deterministic tests before adding new features.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown validation error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
