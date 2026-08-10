import { NextRequest, NextResponse } from "next/server";
import { saveAssessmentSubmission } from "@/lib/server/report-store";

const QUESTION_IDS = Array.from({ length: 18 }, (_, index) => `q${index + 1}`);

function taipeiDateStamp() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()).replace(/-/g, "");
}

function makeAssessmentId(name: string, birthDate: string, params: URLSearchParams) {
  const dateStamp = taipeiDateStamp();
  const raw = `${dateStamp}|${name}|${birthDate}|${QUESTION_IDS.map(id => params.get(id) || "3").join("")}`;
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const suffix = (hash >>> 0).toString(36).toUpperCase().padStart(7, "0").slice(-7);
  return `HD-${dateStamp}-${suffix}`;
}

export async function middleware(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  if (search.get("step") !== "3") return NextResponse.next();

  const name = search.get("name") || "";
  const birthDate = search.get("birthDate") || "";
  const unknownTime = search.get("unknownTime") === "1";
  const birthTime = unknownTime ? null : (search.get("birthTime") || null);
  const birthCity = search.get("birthCity") || "";
  const assessmentId = makeAssessmentId(name, birthDate, search);
  const params = Object.fromEntries(search.entries());

  try {
    await saveAssessmentSubmission({ assessmentId, name, birthDate, birthTime, birthCity, params });
  } catch (error) {
    console.error("assessment persistence failed", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/assessment"],
};
