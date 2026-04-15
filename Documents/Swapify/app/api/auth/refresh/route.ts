import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/spotify";

export async function POST(request: NextRequest) {
  try {
    const { refresh_token } = await request.json();
    if (!refresh_token) {
      return NextResponse.json({ error: "Missing refresh_token" }, { status: 400 });
    }

    const tokens = await refreshAccessToken(refresh_token);
    return NextResponse.json(tokens);
  } catch (err) {
    console.error("Refresh error:", err);
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
  }
}
