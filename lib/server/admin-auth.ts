import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "hd_admin_session";

function configuredPassword() {
  return process.env.ADMIN_REPORTS_PASSWORD || "";
}

function tokenFor(password: string) {
  return createHash("sha256").update(`human-design-admin:${password}`).digest("hex");
}

export function isValidAdminPassword(input: string) {
  const configured = configuredPassword();
  if (!configured || !input) return false;
  const a = Buffer.from(tokenFor(input));
  const b = Buffer.from(tokenFor(configured));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdminAuthenticated() {
  const configured = configuredPassword();
  if (!configured) return false;
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === tokenFor(configured);
}

export function adminSessionToken() {
  const configured = configuredPassword();
  return configured ? tokenFor(configured) : "";
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
