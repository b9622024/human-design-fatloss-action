export type StoredAssessmentReport = {
  id: string;
  assessment_id: string;
  name: string;
  birth_date: string | null;
  birth_time: string | null;
  birth_city: string | null;
  report_json: {
    schemaVersion?: string;
    assessmentId?: string;
    submittedAt?: string;
    params?: Record<string, string>;
    [key: string]: unknown;
  };
  created_at: string;
};

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Supabase server environment variables are not configured.");
  return { url: url.replace(/\/$/, ""), key };
}

function headers(key: string, extra: Record<string, string> = {}) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export async function saveAssessmentSubmission(input: {
  assessmentId: string;
  name: string;
  birthDate: string;
  birthTime: string | null;
  birthCity: string;
  params: Record<string, string>;
}) {
  const { url, key } = supabaseConfig();
  const body = {
    assessment_id: input.assessmentId,
    name: input.name,
    birth_date: input.birthDate || null,
    birth_time: input.birthTime || null,
    birth_city: input.birthCity || null,
    report_json: {
      schemaVersion: "human-design-fatloss-submission-v1",
      assessmentId: input.assessmentId,
      submittedAt: new Date().toISOString(),
      params: input.params,
    },
  };

  const response = await fetch(`${url}/rest/v1/assessment_reports?on_conflict=assessment_id`, {
    method: "POST",
    headers: headers(key, { Prefer: "resolution=merge-duplicates,return=minimal" }),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase save failed (${response.status}): ${detail}`);
  }
}

export async function listAssessmentReports(search = "") {
  const { url, key } = supabaseConfig();
  const query = new URLSearchParams({
    select: "id,assessment_id,name,birth_date,birth_time,birth_city,created_at",
    order: "created_at.desc",
    limit: "100",
  });

  const term = search.trim();
  if (term) {
    const safe = term.replace(/[,%()]/g, " ").trim();
    if (safe) query.set("or", `(assessment_id.ilike.*${safe}*,name.ilike.*${safe}*)`);
  }

  const response = await fetch(`${url}/rest/v1/assessment_reports?${query.toString()}`, {
    headers: headers(key),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Supabase list failed (${response.status})`);
  return await response.json() as Omit<StoredAssessmentReport, "report_json">[];
}

export async function getAssessmentReport(assessmentId: string) {
  const { url, key } = supabaseConfig();
  const query = new URLSearchParams({
    select: "*",
    assessment_id: `eq.${assessmentId}`,
    limit: "1",
  });
  const response = await fetch(`${url}/rest/v1/assessment_reports?${query.toString()}`, {
    headers: headers(key),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Supabase read failed (${response.status})`);
  const rows = await response.json() as StoredAssessmentReport[];
  return rows[0] || null;
}
