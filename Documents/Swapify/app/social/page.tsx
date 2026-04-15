import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SocialClient from "@/components/SocialClient";

export default async function SocialPage() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("spotify_tokens");
  if (!tokenCookie) redirect("/login");

  return <SocialClient />;
}
