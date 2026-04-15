import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

function getTokens(request: NextRequest) {
  const cookie = request.cookies.get("spotify_tokens");
  if (!cookie) return null;
  try { return JSON.parse(cookie.value); } catch { return null; }
}

export async function GET(request: NextRequest) {
  const tokens = getTokens(request);
  if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const supabase = createServiceRoleClient();

  const { data: users } = await supabase
    .from("users")
    .select("id, display_name, avatar_url")
    .ilike("display_name", `%${q}%`)
    .neq("id", tokens.user_id)
    .limit(10);

  return NextResponse.json({ users: users ?? [] });
}
