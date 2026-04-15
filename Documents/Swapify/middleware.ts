import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED = ["/discover", "/dashboard", "/social", "/trending", "/settings"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            response.cookies.set(name, value, options as any)
          );
        },
      },
    }
  );

  // Check for Spotify token cookie
  const spotifyTokenCookie = request.cookies.get("spotify_tokens");
  const { pathname } = request.nextUrl;

  // Handle token refresh for API routes that need Spotify access
  if (spotifyTokenCookie && pathname.startsWith("/api/")) {
    try {
      const tokens = JSON.parse(spotifyTokenCookie.value);
      if (tokens.expires_at && Date.now() > tokens.expires_at - 60_000) {
        // Token expired or about to expire — refresh it
        const refreshRes = await fetch(
          `${request.nextUrl.origin}/api/auth/refresh`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: tokens.refresh_token }),
          }
        );

        if (refreshRes.ok) {
          const newTokens = await refreshRes.json();
          response.cookies.set("spotify_tokens", JSON.stringify(newTokens), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
          });
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Redirect unauthenticated users away from protected routes
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (isProtected && !spotifyTokenCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
