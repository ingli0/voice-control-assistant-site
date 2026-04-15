import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("spotify_tokens");

  if (tokenCookie) {
    redirect("/discover");
  } else {
    redirect("/login");
  }
}
