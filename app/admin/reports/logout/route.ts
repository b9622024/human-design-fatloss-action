import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/server/admin-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/reports", request.url), 303);
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin/reports",
    maxAge: 0,
  });
  return response;
}
