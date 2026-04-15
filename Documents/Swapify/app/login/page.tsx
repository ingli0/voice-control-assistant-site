import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginClient from "@/components/LoginClient";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("spotify_tokens");
  if (tokenCookie) redirect("/discover");

  const params = await searchParams;
  return <LoginClient error={params.error} />;
}
