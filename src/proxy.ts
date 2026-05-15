import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Edge-compatible proxy (formerly middleware).
 * Uses getToken instead of full auth() to avoid pulling Prisma + bcrypt into
 * the edge runtime, which makes proxy invocations dramatically faster.
 *
 * Also adds security headers and blocks common attack patterns.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

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

  // Skip auth routes — never gate them
  if (pathname.startsWith("/api/auth")) {
    return addSecurityHeaders(NextResponse.next());
  }

  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/api");

  if (!isProtected) {
    return addSecurityHeaders(NextResponse.next());
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return addSecurityHeaders(NextResponse.next());
}

/** Add security headers to all responses */
function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  return response;
}

export const config = {
  matcher: [
    // Apply to dashboard + all api routes EXCEPT static assets and auth
    "/dashboard/:path*",
    "/api/((?!auth).*)",
  ],
};
