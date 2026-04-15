import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

function getTokens(request: NextRequest) {
  const cookie = request.cookies.get("spotify_tokens");
  if (!cookie) return null;
  try { return JSON.parse(cookie.value); } catch { return null; }
}

// GET /api/social/friends — list friends & pending requests
export async function GET(request: NextRequest) {
  const tokens = getTokens(request);
  if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceRoleClient();
  const userId = tokens.user_id;

  const { data: friendships } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id, status, created_at")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  const allIds = new Set<string>();
  for (const f of friendships ?? []) {
    if (f.requester_id !== userId) allIds.add(f.requester_id);
    if (f.addressee_id !== userId) allIds.add(f.addressee_id);
  }

  const { data: users } = await supabase
    .from("users")
    .select("id, display_name, avatar_url")
    .in("id", [...allIds]);

  const userMap = new Map((users ?? []).map((u: { id: string; display_name: string; avatar_url: string | null }) => [u.id, u]));

  const result = (friendships ?? []).map((f: { id: string; requester_id: string; addressee_id: string; status: string; created_at: string }) => {
    const otherId = f.requester_id === userId ? f.addressee_id : f.requester_id;
    return {
      id: f.id,
      status: f.status,
      isRequester: f.requester_id === userId,
      user: userMap.get(otherId) ?? { id: otherId, display_name: "Unknown", avatar_url: null },
      created_at: f.created_at,
    };
  });

  return NextResponse.json({ friendships: result });
}

// POST /api/social/friends — send friend request
export async function POST(request: NextRequest) {
  const tokens = getTokens(request);
  if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { addressee_id } = await request.json();
  if (!addressee_id) return NextResponse.json({ error: "Missing addressee_id" }, { status: 400 });

  const supabase = createServiceRoleClient();
  const userId = tokens.user_id;

  // Check if friendship already exists
  const { data: existing } = await supabase
    .from("friendships")
    .select("id, status")
    .or(
      `and(requester_id.eq.${userId},addressee_id.eq.${addressee_id}),and(requester_id.eq.${addressee_id},addressee_id.eq.${userId})`
    )
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Friendship already exists", status: existing.status });
  }

  const { data, error } = await supabase
    .from("friendships")
    .insert({ requester_id: userId, addressee_id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ friendship: data });
}

// PATCH /api/social/friends — accept/reject friend request
export async function PATCH(request: NextRequest) {
  const tokens = getTokens(request);
  if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { friendship_id, status } = await request.json();
  if (!friendship_id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("friendships")
    .update({ status })
    .eq("id", friendship_id)
    .eq("addressee_id", tokens.user_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
