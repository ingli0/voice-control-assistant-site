import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("spotify_tokens");
  if (!tokenCookie) redirect("/login");

  return <DashboardClient />;
}
