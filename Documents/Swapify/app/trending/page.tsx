import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TrendingClient from "@/components/TrendingClient";

export default async function TrendingPage() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("spotify_tokens");
  if (!tokenCookie) redirect("/login");

  return <TrendingClient />;
}
