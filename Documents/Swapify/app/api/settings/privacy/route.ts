import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

function getTokens(request: NextRequest) {
  const cookie = request.cookies.get("spotify_tokens");
  if (!cookie) return null;
  try { return JSON.parse(cookie.value); } catch { return null; }
}

export async function PATCH(request: NextRequest) {
  const tokens = getTokens(request);
  if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { privacy } = await request.json();
  if (!["public", "friends", "private"].includes(privacy)) {
    return NextResponse.json({ error: "Invalid privacy value" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  await supabase
    .from("users")
    .update({ privacy })
    .eq("id", tokens.user_id);

  return NextResponse.json({ ok: true });
}
