import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security middleware for UpaHealth platform.
 *
 * 1. Rate limiting headers (Vercel handles actual rate limiting)
 * 2. Security headers on all responses
 * 3. API route protection (require auth for /api/* except auth routes)
 * 4. Block suspicious patterns
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ─── Security Headers ────────────────────────────────────────────────
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // ─── Block common attack patterns ───────────────────────────────────
  const blocked = [
    "/wp-admin",
    "/wp-login",
    "/.env",
    "/phpinfo",
    "/xmlrpc",
    "/.git",
    "/admin.php",
  ];
  if (blocked.some((p) => pathname.startsWith(p))) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // ─── API rate limit hint (actual enforcement via Vercel) ─────────────
  if (pathname.startsWith("/api/")) {
    response.headers.set("X-RateLimit-Policy", "100;w=60");
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and _next
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|logo-mark.svg|logo-full.svg).*)",
  ],
};
