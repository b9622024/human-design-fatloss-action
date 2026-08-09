import { NextResponse } from "next/server";
import { discoverGoldenCandidates } from "@/lib/human-design/golden-discovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = discoverGoldenCandidates();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Golden discovery error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
