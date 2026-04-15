import { NextResponse } from "next/server";
import { buildAuthUrl } from "@/lib/spotify";
import { randomBytes } from "crypto";

export async function GET() {
  const state = randomBytes(16).toString("hex");

  const res = NextResponse.redirect(buildAuthUrl(state));
  res.cookies.set("spotify_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return res;
}
