import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Edge-compatible proxy (formerly middleware).
 * Uses getToken instead of full auth() to avoid pulling Prisma + bcrypt into
 * the edge runtime, which makes proxy invocations dramatically faster.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip auth routes — never gate them
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/api");

  if (!isProtected) {
    return NextResponse.next();
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply to dashboard + all api routes EXCEPT static assets and auth
    "/dashboard/:path*",
    "/api/((?!auth).*)",
  ],
};
