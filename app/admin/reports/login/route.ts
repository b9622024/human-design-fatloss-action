import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, adminSessionToken, isValidAdminPassword } from "@/lib/server/admin-auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get("password") || "");
  if (!isValidAdminPassword(password)) {
    return NextResponse.redirect(new URL("/admin/reports?error=1", request.url), 303);
  }

  const response = NextResponse.redirect(new URL("/admin/reports/list", request.url), 303);
  response.cookies.set(ADMIN_COOKIE_NAME, adminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin/reports",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
